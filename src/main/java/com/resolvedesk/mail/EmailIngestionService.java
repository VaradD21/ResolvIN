package com.resolvedesk.mail;

import com.resolvedesk.domain.ProcessedEmail;
import com.resolvedesk.domain.Ticket;
import com.resolvedesk.repository.ProcessedEmailRepository;
import com.resolvedesk.service.TicketOrchestrator;
import jakarta.mail.Message;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@EnableConfigurationProperties(MailProperties.class)
public class EmailIngestionService {

    private static final Logger log = LoggerFactory.getLogger(EmailIngestionService.class);

    private final MailProperties props;
    private final ImapClient imapClient;
    private final EmailParser emailParser;
    private final ProcessedEmailRepository processedEmails;
    private final TicketOrchestrator ticketOrchestrator;

    @Scheduled(fixedDelayString = "${resolvedesk.mail.poll-interval-seconds:60}000")
    public void pollInbox() {
        if (!props.enabled()) {
            log.debug("Email ingestion is disabled (resolvedesk.mail.enabled=false)");
            return;
        }

        if (props.username() == null || props.username().isBlank() ||
            props.password() == null || props.password().isBlank()) {
            log.warn("Email ingestion enabled but username or password is not configured");
            return;
        }

        log.debug("Starting email poll cycle on {}:{} ({})", props.host(), props.port(), props.folder());

        try (ImapClient.MailboxConnection conn = imapClient.connect(props)) {
            Message[] messages = imapClient.fetchUnreadMessages(conn.folder());
            if (messages.length > 0) {
                log.info("Found {} unread email(s) in {}", messages.length, props.folder());
            }

            for (Message message : messages) {
                processMessage(message);
            }
        } catch (Exception e) {
            log.warn("IMAP poll cycle failed for host {}:{}: {}", props.host(), props.port(), e.getMessage());
        }
    }

    public void processMessage(Message message) {
        try {
            ParsedEmail email = emailParser.parse(message);

            if (processedEmails.existsByMessageId(email.messageId())) {
                log.info("Skipping already processed email with Message-ID: {}", email.messageId());
                imapClient.markAsRead(message);
                return;
            }

            log.info("Ingesting new email from '{}' with subject '{}' (Message-ID: {})",
                    email.sender(), email.subject(), email.messageId());

            Ticket ticket = ticketOrchestrator.createTicket(
                    props.brandId(),
                    email.sender(),
                    email.subject(),
                    email.body()
            );

            ticketOrchestrator.processNewTicketAsync(ticket.getId());

            ProcessedEmail record = new ProcessedEmail();
            record.setMessageId(email.messageId());
            record.setSender(email.sender());
            record.setSubject(email.subject());
            record.setTicketId(ticket.getId());
            processedEmails.save(record);

            imapClient.markAsRead(message);

            log.info("Successfully ingested email into Ticket #{}", ticket.getId());

        } catch (Exception e) {
            log.error("Failed to process email from IMAP mailbox: {}", e.getMessage(), e);
        }
    }
}
