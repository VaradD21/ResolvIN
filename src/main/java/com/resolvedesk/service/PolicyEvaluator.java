package com.resolvedesk.service;

import com.resolvedesk.domain.Brand;
import com.resolvedesk.domain.OrderCache;
import com.resolvedesk.domain.Ticket;
import com.resolvedesk.domain.TicketCategory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

/**
 * Pure deterministic policy engine. No LLM calls, no I/O, no side effects.
 * Takes already-fetched entities, returns a decision.
 */
@Component
public class PolicyEvaluator {

    // ponytail: global safety ceiling — protects against a brand accidentally setting
    // maxAutoResolveOrderValue too high or leaving it null. No brand policy can override this.
    // Set in application.yml: resolvedesk.global-max-auto-resolve-value
    private final BigDecimal globalMaxAutoResolveValue;

    public PolicyEvaluator(
            @Value("${resolvedesk.global-max-auto-resolve-value:5000}") BigDecimal globalMaxAutoResolveValue) {
        this.globalMaxAutoResolveValue = globalMaxAutoResolveValue;
    }

    public PolicyDecision evaluate(Ticket ticket, OrderCache order, Brand brand) {
        // 1. Low confidence check wins first — applies to every category
        Double confidence = ticket.getConfidence();
        if (confidence != null && confidence < 0.7) {
            return PolicyDecision.ineligible("low classifier confidence");
        }

        // 2. Order required for all non-lookup categories
        if (order == null) {
            TicketCategory cat = ticket.getCategory();
            if (cat == TicketCategory.WISMO || cat == TicketCategory.REFUND_STATUS) {
                // lookup-only: don't need a real order object
            } else {
                return PolicyDecision.ineligible("order not found");
            }
        }

        return switch (ticket.getCategory()) {
            case WISMO         -> new PolicyDecision(true, PolicyAction.REPLY_ONLY, "shipment status lookup");
            case REFUND_STATUS -> new PolicyDecision(true, PolicyAction.REPLY_ONLY, "refund status lookup");
            case RETURN        -> evaluateReturn(order, brand, PolicyAction.REFUND);
            case EXCHANGE      -> evaluateReturn(order, brand, PolicyAction.EXCHANGE);
            case CANCELLATION  -> evaluateCancellation(order);
            case OTHER         -> PolicyDecision.ineligible("unclassified or flagged");
        };
    }

    // shared eligibility logic for RETURN and EXCHANGE (same rules, different action)
    private PolicyDecision evaluateReturn(OrderCache order, Brand brand, PolicyAction action) {
        Map<String, Object> policy = brand.getPolicy();

        // delivered?
        OffsetDateTime deliveredAt = parseDateTime(order.getData(), "deliveredAt");
        if (deliveredAt == null) {
            return PolicyDecision.ineligible("order not yet delivered");
        }

        // return window
        int returnWindowDays = intPolicyField(policy, "returnWindowDays", 0);
        long daysSince = ChronoUnit.DAYS.between(deliveredAt.toLocalDate(), java.time.LocalDate.now());
        if (daysSince > returnWindowDays) {
            return PolicyDecision.ineligible("return window expired");
        }

        // non-returnable category
        String orderCategory = stringDataField(order.getData(), "category");
        List<String> nonReturnable = listPolicyField(policy, "nonReturnableCategories");
        if (orderCategory != null && nonReturnable.stream()
                .anyMatch(c -> c.equalsIgnoreCase(orderCategory))) {
            return PolicyDecision.ineligible("non-returnable category");
        }

        // order value — brand limit
        BigDecimal orderValue = decimalDataField(order.getData(), "orderValue");
        if (orderValue != null) {
            BigDecimal brandMax = decimalPolicyField(policy, "maxAutoResolveOrderValue");
            if (brandMax != null && orderValue.compareTo(brandMax) > 0) {
                return PolicyDecision.ineligible("order value exceeds auto-resolve limit");
            }

            // global ceiling (hard cap, brand cannot override)
            if (orderValue.compareTo(globalMaxAutoResolveValue) > 0) {
                return PolicyDecision.ineligible("order value exceeds global auto-resolve ceiling");
            }
        }

        return new PolicyDecision(true, action, action == PolicyAction.REFUND ? "return eligible" : "exchange eligible");
    }

    private PolicyDecision evaluateCancellation(OrderCache order) {
        String fulfillmentStatus = stringDataField(order.getData(), "fulfillmentStatus");
        if ("shipped".equalsIgnoreCase(fulfillmentStatus) || "delivered".equalsIgnoreCase(fulfillmentStatus)) {
            return PolicyDecision.ineligible("already shipped");
        }
        return new PolicyDecision(true, PolicyAction.CANCEL, "cancellation eligible");
    }

    // --- safe JSONB field readers ---

    private int intPolicyField(Map<String, Object> policy, String key, int defaultValue) {
        if (policy == null) return defaultValue;
        Object val = policy.get(key);
        if (val instanceof Number n) return n.intValue();
        return defaultValue;
    }

    @SuppressWarnings("unchecked")
    private List<String> listPolicyField(Map<String, Object> policy, String key) {
        if (policy == null) return List.of();
        Object val = policy.get(key);
        if (val instanceof List<?> list) return (List<String>) list;
        return List.of();
    }

    private BigDecimal decimalPolicyField(Map<String, Object> policy, String key) {
        if (policy == null) return null;
        Object val = policy.get(key);
        if (val instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        if (val instanceof String s) return new BigDecimal(s);
        return null;
    }

    private BigDecimal decimalDataField(Map<String, Object> data, String key) {
        return decimalPolicyField(data, key); // same extraction logic
    }

    private String stringDataField(Map<String, Object> data, String key) {
        if (data == null) return null;
        Object val = data.get(key);
        return val instanceof String s ? s : null;
    }

    private OffsetDateTime parseDateTime(Map<String, Object> data, String key) {
        if (data == null) return null;
        Object val = data.get(key);
        if (val instanceof String s && !s.isBlank()) {
            try { return OffsetDateTime.parse(s); } catch (Exception ignored) {}
        }
        return null;
    }
}
