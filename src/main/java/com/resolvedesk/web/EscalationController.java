package com.resolvedesk.web;

import com.resolvedesk.domain.Escalation;
import com.resolvedesk.domain.ResolutionAction;
import com.resolvedesk.repository.EscalationRepository;
import com.resolvedesk.service.EscalationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/escalations")
@RequiredArgsConstructor
public class EscalationController {

    private final EscalationRepository escalations;
    private final EscalationService escalationService;

    public record ResolveEscalationRequest(
            @NotNull ResolutionAction resolutionAction,
            String resolutionNote,
            String resolvedBy
    ) {}

    public record EscalationResponse(
            Long id,
            Long ticketId,
            String reason,
            String subject,
            String customerEmail,
            Map<String, Object> contextBundle,
            OffsetDateTime createdAt,
            OffsetDateTime resolvedAt,
            String resolvedBy,
            String resolutionNote,
            String resolutionAction
    ) {
        public static EscalationResponse from(Escalation e) {
            return new EscalationResponse(
                    e.getId(),
                    e.getTicket().getId(),
                    e.getReason(),
                    e.getTicket().getSubject(),
                    e.getTicket().getCustomerEmail(),
                    e.getContextBundle(),
                    e.getCreatedAt(),
                    e.getResolvedAt(),
                    e.getResolvedBy(),
                    e.getResolutionNote(),
                    e.getResolutionAction() != null ? e.getResolutionAction().name() : null
            );
        }
    }

    @GetMapping
    public List<EscalationResponse> getUnresolved() {
        return escalations.findAllUnresolved().stream()
                .map(EscalationResponse::from)
                .toList();
    }

    @PostMapping("/{id}/resolve")
    public EscalationResponse resolve(
            @PathVariable Long id,
            @Valid @RequestBody ResolveEscalationRequest req
    ) {
        Escalation resolved = escalationService.resolveEscalation(
                id,
                req.resolutionAction(),
                req.resolutionNote(),
                req.resolvedBy()
        );
        return EscalationResponse.from(resolved);
    }
}
