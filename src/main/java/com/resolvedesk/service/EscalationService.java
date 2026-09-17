package com.resolvedesk.service;

import com.resolvedesk.domain.*;
import com.resolvedesk.repository.ActionRepository;
import com.resolvedesk.repository.EscalationRepository;
import com.resolvedesk.repository.TicketEventRepository;
import com.resolvedesk.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EscalationService {

    private final EscalationRepository escalations;
    private final TicketRepository tickets;
    private final ActionRepository actions;
    private final TicketEventRepository events;

    @Transactional
    public Escalation resolveEscalation(Long escalationId, ResolutionAction resolutionAction, String resolutionNote, String resolvedBy) {
        Escalation escalation = escalations.findById(escalationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Escalation not found: " + escalationId));

        if (escalation.getResolvedAt() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Escalation has already been resolved");
        }

        if (resolutionAction == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "resolutionAction is required");
        }

        String agentName = (resolvedBy != null && !resolvedBy.isBlank()) ? resolvedBy.trim() : "agent";
        String note = (resolutionNote != null && !resolutionNote.isBlank()) ? resolutionNote.trim() : "";

        escalation.setResolvedAt(OffsetDateTime.now());
        escalation.setResolvedBy(agentName);
        escalation.setResolutionNote(note);
        escalation.setResolutionAction(resolutionAction);
        escalations.save(escalation);

        Ticket ticket = escalation.getTicket();

        if (resolutionAction.isApproved()) {
            String actionType = resolutionAction.toActionType();

            Action action = new Action();
            action.setTicket(ticket);
            action.setType(actionType);

            Map<String, Object> payload = new HashMap<>();
            payload.put("status", "pending");
            payload.put("source", "human_escalation");
            payload.put("approvedBy", agentName);
            if (!note.isBlank()) {
                payload.put("note", note);
            }

            if ("REFUND".equals(actionType) && ticket.getOrderCache() != null && ticket.getOrderCache().getData() != null) {
                Object orderValue = ticket.getOrderCache().getData().get("orderValue");
                if (orderValue != null) {
                    payload.put("amount", orderValue);
                }
            }

            action.setPayload(payload);
            actions.save(action);

            ticket.setStatus(TicketStatus.AUTO_RESOLVED);
            tickets.save(ticket);

            TicketEvent actionEvent = new TicketEvent();
            actionEvent.setTicket(ticket);
            actionEvent.setType("action_taken");
            actionEvent.setPayload(Map.of(
                    "action", actionType,
                    "approvedBy", agentName,
                    "note", note,
                    "source", "human_escalation"
            ));
            events.save(actionEvent);
        }

        TicketEvent resolvedEvent = new TicketEvent();
        resolvedEvent.setTicket(ticket);
        resolvedEvent.setType("escalation_resolved");

        Map<String, Object> eventPayload = new HashMap<>();
        eventPayload.put("escalationId", escalation.getId());
        eventPayload.put("action", resolutionAction.name());
        eventPayload.put("resolvedBy", agentName);
        eventPayload.put("resolvedAt", escalation.getResolvedAt().toString());
        if (!note.isBlank()) {
            eventPayload.put("note", note);
        }
        resolvedEvent.setPayload(eventPayload);
        events.save(resolvedEvent);

        return escalation;
    }
}
