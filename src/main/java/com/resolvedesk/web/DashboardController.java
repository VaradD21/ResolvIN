package com.resolvedesk.web;

import com.resolvedesk.domain.Ticket;
import com.resolvedesk.domain.TicketEvent;
import com.resolvedesk.repository.BrandRepository;
import com.resolvedesk.repository.TicketEventRepository;
import com.resolvedesk.repository.TicketRepository;
import com.resolvedesk.service.TicketOrchestrator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final TicketRepository tickets;
    private final BrandRepository brands;
    private final TicketEventRepository events;
    private final TicketOrchestrator orchestrator;

    @GetMapping("/tickets")
    public String listTickets(Model model) {
        model.addAttribute("tickets", tickets.findAllByOrderByCreatedAtDesc());
        return "tickets/list";
    }

    @GetMapping("/tickets/{id}")
    public String ticketDetail(@PathVariable Long id, Model model) {
        Ticket ticket = tickets.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid ticket Id:" + id));
        List<TicketEvent> ticketEvents = events.findByTicketIdOrderByCreatedAtDesc(id);

        model.addAttribute("ticket", ticket);
        model.addAttribute("events", ticketEvents);
        return "tickets/detail";
    }

    @GetMapping("/tickets/new")
    public String newTicketForm(Model model) {
        model.addAttribute("brands", brands.findAll());
        return "tickets/new";
    }

    @PostMapping("/tickets")
    public String createTicket(@RequestParam Long brandId,
                               @RequestParam String customerEmail,
                               @RequestParam String subject,
                               @RequestParam String body) {
        Ticket ticket = orchestrator.createTicket(brandId, customerEmail, subject, body);
        orchestrator.processNewTicketAsync(ticket.getId());
        return "redirect:/dashboard/tickets/" + ticket.getId();
    }
}
