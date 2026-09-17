package com.resolvedesk.mail;

public record ParsedEmail(
        String messageId,
        String sender,
        String subject,
        String body
) {}
