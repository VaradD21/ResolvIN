package com.resolvedesk.mail;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "resolvedesk.mail")
public record MailProperties(
        boolean enabled,
        String host,
        int port,
        String username,
        String password,
        int pollIntervalSeconds,
        Long brandId,
        String protocol,
        String folder
) {
    public MailProperties {
        if (port <= 0) port = 993;
        if (pollIntervalSeconds <= 0) pollIntervalSeconds = 60;
        if (brandId == null) brandId = 1L;
        if (protocol == null || protocol.isBlank()) protocol = "imaps";
        if (folder == null || folder.isBlank()) folder = "INBOX";
    }
}
