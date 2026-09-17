package com.resolvedesk.mail;

import jakarta.mail.*;
import jakarta.mail.search.FlagTerm;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Properties;

@Component
public class ImapClient {

    private static final Logger log = LoggerFactory.getLogger(ImapClient.class);

    public record MailboxConnection(Store store, Folder folder) implements AutoCloseable {
        @Override
        public void close() {
            if (folder != null && folder.isOpen()) {
                try {
                    folder.close(false);
                } catch (Exception e) {
                    log.warn("Error closing IMAP folder: {}", e.getMessage());
                }
            }
            if (store != null && store.isConnected()) {
                try {
                    store.close();
                } catch (Exception e) {
                    log.warn("Error closing IMAP store: {}", e.getMessage());
                }
            }
        }
    }

    public MailboxConnection connect(MailProperties props) throws Exception {
        String protocol = props.protocol() != null ? props.protocol().toLowerCase() : "imaps";
        Properties sessionProps = new Properties();

        sessionProps.put("mail.store.protocol", protocol);
        sessionProps.put("mail." + protocol + ".host", props.host());
        sessionProps.put("mail." + protocol + ".port", String.valueOf(props.port()));
        sessionProps.put("mail." + protocol + ".connectiontimeout", "10000");
        sessionProps.put("mail." + protocol + ".timeout", "15000");

        if ("imaps".equals(protocol)) {
            sessionProps.put("mail.imaps.ssl.enable", "true");
        }

        Session session = Session.getInstance(sessionProps);
        Store store = session.getStore(protocol);
        store.connect(props.host(), props.port(), props.username(), props.password());

        Folder folder = store.getFolder(props.folder());
        if (!folder.exists()) {
            store.close();
            throw new IllegalStateException("IMAP folder '" + props.folder() + "' does not exist");
        }

        folder.open(Folder.READ_WRITE);
        return new MailboxConnection(store, folder);
    }

    public Message[] fetchUnreadMessages(Folder folder) throws Exception {
        Flags seenFlag = new Flags(Flags.Flag.SEEN);
        FlagTerm unseenTerm = new FlagTerm(seenFlag, false);
        return folder.search(unseenTerm);
    }

    public void markAsRead(Message message) {
        try {
            message.setFlag(Flags.Flag.SEEN, true);
        } catch (Exception e) {
            log.warn("Failed to set SEEN flag on message: {}", e.getMessage());
        }
    }
}
