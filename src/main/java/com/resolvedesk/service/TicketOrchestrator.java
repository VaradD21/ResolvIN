package com.resolvedesk.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resolvedesk.domain.*;
import com.resolvedesk.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TicketOrchestrator {

    private static final Logger log = LoggerFactory.getLogger(TicketOrchestrator.class);

    private final TicketRepository tickets;
    private final BrandRepository brands;
    private final TicketEventRepository events;
    private final OrderCacheRepository orders;
    private final ActionRepository actions;
    private final EscalationRepository escalations;
    private final ClassifierService classifier;
    private final PolicyEvaluator policyEvaluator;
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
            ClassificationResult classification = classifier.classify(ticket.getSubject(), ticket.getBody());

            ticket.setCategory(classification.category());
            ticket.setConfidence(classification.confidence());

            // 2. Fetch Order if ID was extracted
            OrderCache order = null;
            if (classification.extractedOrderId() != null) {
                order = orders.findByBrandIdAndExternalOrderId(
                        ticket.getBrand().getId(), classification.extractedOrderId()
                ).orElse(null);

                if (order != null) {
                    ticket.setOrderCache(order);
                }
            }

            tickets.save(ticket);

            // Audit internal classification metadata
            logEvent(ticket, "ticket_classified", mapper.convertValue(classification, new TypeReference<>() {}));

            // 3. Evaluate Policy (deterministic)
            PolicyDecision decision = policyEvaluator.evaluate(ticket, order, ticket.getBrand());
            logEvent(ticket, "policy_checked", mapper.convertValue(decision, new TypeReference<>() {}));

            // 4. Resolve or Escalate
            if (decision.eligible()) {
                applyAutoResolution(ticket, order, decision);
            } else {
                applyEscalation(ticket, classification, decision);
            }

        } catch (Exception e) {
            log.error("processNewTicketAsync: failed for ticket {}", ticketId, e);
            // Fallback for unexpected craskes during orchestration
            applyEscalation(ticket, null, PolicyDecision.ineligible("system error during orchestration: " + e.getMessage()));
        }
    }

    private void applyAutoResolution(Ticket ticket, OrderCache order, PolicyDecision decision) {
        // Record the pending action (stub for real API integrations later)
        Action action = new Action();
        action.setTicket(ticket);
        action.setType(decision.action().name());

        Map<String, Object> payload = new HashMap<>();
        payload.put("status", "pending");
        if (decision.action() == PolicyAction.REFUND && order != null && order.getData() != null) {
            Object orderValue = order.getData().get("orderValue");
            payload.put("amount", orderValue);
        }
        action.setPayload(payload);
        actions.save(action);

        logEvent(ticket, "action_taken", Map.of("action", decision.action().name(), "reason", decision.reason()));

        ticket.setStatus(TicketStatus.AUTO_RESOLVED);
        tickets.save(ticket);

        // Generate and log the customer reply
        String replyMsg = generateReply(decision.action(), order);
        logEvent(ticket, "replied", Map.of("message", replyMsg));
    }

    private void applyEscalation(Ticket ticket, ClassificationResult classification, PolicyDecision decision) {
        Escalation esc = new Escalation();
        esc.setTicket(ticket);
        esc.setReason(decision.reason());

        Map<String, Object> ctx = new HashMap<>();
        ctx.put("subject", ticket.getSubject());
        ctx.put("body", ticket.getBody());
        if (classification != null) {
            ctx.put("classification", mapper.convertValue(classification, new TypeReference<>() {}));
        }
        ctx.put("decision", mapper.convertValue(decision, new TypeReference<>() {}));
        esc.setContextBundle(ctx);

        escalations.save(esc);
        logEvent(ticket, "escalated", Map.of("reason", decision.reason()));

        ticket.setStatus(TicketStatus.ESCALATED);
        tickets.save(ticket);
    }

    private void logEvent(Ticket ticket, String type, Map<String, Object> payload) {
        TicketEvent event = new TicketEvent();
        event.setTicket(ticket);
        event.setType(type);
        event.setPayload(payload);
        events.save(event);
    }

    private String generateReply(PolicyAction action, OrderCache order) {
        return switch (action) {
            case REFUND -> "Your refund has been initiated and will reflect in 3-5 business days.";
            case EXCHANGE -> "Your exchange request has been approved. A return pickup will be scheduled.";
            case CANCEL -> "Your order has been successfully canceled and refunded.";
            case REPLY_ONLY -> {
                if (order != null && order.getData() != null) {
                    Object status = order.getData().get("fulfillmentStatus");
                    Object track = order.getData().get("trackingNumber");
                    yield "Your order status is: " + (status != null ? status : "processing") +
                          (track != null ? " (Tracking: " + track + ")" : "");
                }
                yield "We received your inquiry. An agent will get back to you shortly.";
            }
            case NONE -> "We are looking into your request.";
        };
    }
}
