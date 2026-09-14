package com.resolvedesk.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resolvedesk.domain.Brand;
import com.resolvedesk.domain.Ticket;
import com.resolvedesk.domain.TicketEvent;
import com.resolvedesk.domain.TicketStatus;
import com.resolvedesk.repository.BrandRepository;
import com.resolvedesk.repository.TicketEventRepository;
import com.resolvedesk.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class TicketOrchestrator {

    private static final Logger log = LoggerFactory.getLogger(TicketOrchestrator.class);

    private final TicketRepository tickets;
    private final BrandRepository brands;
    private final TicketEventRepository events;
    private final ClassifierService classifier;
    private final ObjectMapper mapper;

    @Transactional
    public Ticket createTicket(Long brandId, String email, String subject, String body) {
        Brand brand = brands.findById(brandId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Brand not found"));

        Ticket ticket = new Ticket();
        ticket.setBrand(brand);
        ticket.setCustomerEmail(email);
        ticket.setSubject(subject);
        ticket.setBody(body);
        ticket.setStatus(TicketStatus.NEW);

        return tickets.save(ticket);
    }

    @Async
    @Transactional
    public void processNewTicketAsync(Long ticketId) {
        Ticket ticket = tickets.findById(ticketId).orElse(null);
        if (ticket == null) {
            log.warn("processNewTicketAsync: ticket {} not found, skipping", ticketId);
            return;
        }

        try {
            // 1. Classify
            ClassificationResult result = classifier.classify(ticket.getSubject(), ticket.getBody());

            // 2. Update Ticket
            ticket.setCategory(result.category());
            // ponytail: confidence and extractedOrderId aren't on the Ticket entity yet,
            // we persist the full result in the TicketEvent. Can add column to Ticket later if querying needs it.
            tickets.save(ticket);

            // 3. Keep audit trail
            TicketEvent event = new TicketEvent();
            event.setTicket(ticket);
            event.setType("ticket_classified");
            Map<String, Object> payload = mapper.convertValue(result, new TypeReference<>() {});
            event.setPayload(payload);
            events.save(event);

        } catch (Exception e) {
            log.error("processNewTicketAsync: failed for ticket {}, ticket left as NEW", ticketId, e);
        }
    }
}
