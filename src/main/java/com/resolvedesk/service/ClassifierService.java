package com.resolvedesk.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resolvedesk.domain.TicketCategory;
import com.resolvedesk.llm.LlmClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.stereotype.Service;

@Service
@EnableConfigurationProperties(ClassifierProperties.class)
public class ClassifierService {

    private static final Logger log = LoggerFactory.getLogger(ClassifierService.class);

    private static final String SYSTEM_PROMPT = """
        You are a customer support ticket classifier.
        Read the ticket subject and body. Respond ONLY with a raw JSON object, no markdown fencing, no preamble.

        The JSON must match this structure exactly:
        {
          "category": "WISMO" | "RETURN" | "EXCHANGE" | "REFUND_STATUS" | "CANCELLATION" | "OTHER",
          "confidence": 0.0 to 1.0,
          "extractedOrderId": "order number if present, else null",
          "extractedIntent": "short summary of the customer's actual request"
        }
        """;

    private final LlmClient llm;
    private final ClassifierProperties props;
    private final ObjectMapper mapper;

    public ClassifierService(LlmClient llm, ClassifierProperties props) {
        this.llm = llm;
        this.props = props;
        this.mapper = new ObjectMapper();
    }

    public ClassificationResult classify(String subject, String body) {
        // Pre-filter: deterministic escalation matching
        if (containsEscalationKeyword(subject, body)) {
            log.info("Ticket triggered hardware escalation filter (pre-LLM)");
            return new ClassificationResult(
                TicketCategory.OTHER,
                0.0,
                null,
                "hard_escalation_trigger"
            );
        }

        // LLM Classification
        try {
            String prompt = String.format("Subject: %s\nBody: %s", subject, body);
            String response = llm.complete(SYSTEM_PROMPT, prompt).trim();

            // Defensively strip markdown if the model hallucinates it despite instructions
            if (response.startsWith("```json")) response = response.substring(7);
            if (response.startsWith("```")) response = response.substring(3);
            if (response.endsWith("```")) response = response.substring(0, response.length() - 3);

            return mapper.readValue(response.trim(), ClassificationResult.class);

        } catch (Exception e) {
            log.warn("Failed to parse LLM classification response, falling back to OTHER", e);
            // ponytail: fail-safe parsing. if model hallucinates or network fails, ticket just flags for human.
            return new ClassificationResult(TicketCategory.OTHER, 0.0, null, "llm_classification_failed");
        }
    }

    boolean containsEscalationKeyword(String subject, String body) {
        if (props.escalationKeywords() == null || props.escalationKeywords().isEmpty()) {
            return false;
        }

        String combined = (subject + " " + body).toLowerCase();
        return props.escalationKeywords().stream()
                .map(String::toLowerCase)
                .anyMatch(combined::contains);
    }
}
