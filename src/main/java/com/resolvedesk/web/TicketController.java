package com.resolvedesk.web;

import com.resolvedesk.domain.Ticket;
import com.resolvedesk.repository.TicketRepository;
import com.resolvedesk.service.TicketOrchestrator;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketRepository tickets;
    private final TicketOrchestrator orchestrator;

    public record CreateTicketRequest(
        @NotBlank @Email String customerEmail,
        @NotBlank String subject,
        @NotBlank String body,
        @NotNull Long brandId
    ) {}

    public record TicketResponse(
        Long id,
        String customerEmail,
        String subject,
        String body,
        Long brandId,
        String status,
        String category,
        OffsetDateTime createdAt
    ) {}

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TicketResponse create(@Valid @RequestBody CreateTicketRequest req) {
        Ticket ticket = orchestrator.createTicket(req.brandId(), req.customerEmail(), req.subject(), req.body());

        // Fire async processing
        orchestrator.processNewTicketAsync(ticket.getId());

        return toResponse(ticket);
    }

    @GetMapping("/{id}")
    public TicketResponse get(@PathVariable Long id) {
        return tickets.findById(id)
            .map(this::toResponse)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    private TicketResponse toResponse(Ticket t) {
        return new TicketResponse(
            t.getId(),
            t.getCustomerEmail(),
            t.getSubject(),
            t.getBody(),
            t.getBrand().getId(),
            t.getStatus().name(),
            t.getCategory() != null ? t.getCategory().name() : null,
            t.getCreatedAt()
        );
    }
}
