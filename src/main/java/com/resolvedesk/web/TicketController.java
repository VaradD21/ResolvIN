package com.resolvedesk.web;

import com.resolvedesk.domain.Brand;
import com.resolvedesk.domain.Ticket;
import com.resolvedesk.domain.TicketStatus;
import com.resolvedesk.repository.BrandRepository;
import com.resolvedesk.repository.TicketRepository;
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
    private final BrandRepository brands;

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
        OffsetDateTime createdAt
    ) {}

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TicketResponse create(@Valid @RequestBody CreateTicketRequest req) {
        Brand brand = brands.findById(req.brandId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Brand not found"));

        Ticket ticket = new Ticket();
        ticket.setBrand(brand);
        ticket.setCustomerEmail(req.customerEmail());
        ticket.setSubject(req.subject());
        ticket.setBody(req.body());
        ticket.setStatus(TicketStatus.NEW);

        ticket = tickets.save(ticket);
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
            t.getCreatedAt()
        );
    }
}
