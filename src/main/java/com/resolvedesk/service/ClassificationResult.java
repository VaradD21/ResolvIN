package com.resolvedesk.service;

import com.resolvedesk.domain.TicketCategory;

public record ClassificationResult(
    TicketCategory category,
    double confidence,
    String extractedOrderId, // e.g. "ORD-123", nullable
    String extractedIntent    // e.g. "where is my order", "I want a refund"
) {}
