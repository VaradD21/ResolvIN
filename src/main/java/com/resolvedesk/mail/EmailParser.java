package com.resolvedesk.mail;

import jakarta.mail.Address;
import jakarta.mail.BodyPart;
import jakarta.mail.Message;
import jakarta.mail.Multipart;
import jakarta.mail.internet.InternetAddress;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.regex.Pattern;

@Component
public class EmailParser {

    private static final Pattern SCRIPT_PATTERN = Pattern.compile("<script[^>]*>.*?</script>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    private static final Pattern STYLE_PATTERN = Pattern.compile("<style[^>]*>.*?</style>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    private static final Pattern BR_PATTERN = Pattern.compile("<br\\s*/?>", Pattern.CASE_INSENSITIVE);
    private static final Pattern BLOCK_PATTERN = Pattern.compile("</?(p|div|tr|li|h[1-6]|blockquote)[^>]*>", Pattern.CASE_INSENSITIVE);
    private static final Pattern TAG_PATTERN = Pattern.compile("<[^>]+>");
    private static final Pattern MULTI_NEWLINE = Pattern.compile("\n{3,}");

    public ParsedEmail parse(Message message) throws Exception {
        String sender = extractSender(message);
        String subject = message.getSubject() != null ? message.getSubject().trim() : "(No Subject)";
        String messageId = extractMessageId(message, sender, subject);
        String body = extractBody(message);

        return new ParsedEmail(messageId, sender, subject, body != null ? body.trim() : "");
    }

    public String extractSender(Message message) throws Exception {
        Address[] from = message.getFrom();
        if (from != null && from.length > 0) {
            if (from[0] instanceof InternetAddress ia && ia.getAddress() != null && !ia.getAddress().isBlank()) {
                return ia.getAddress().trim();
            }
            String raw = from[0].toString();
            int start = raw.indexOf('<');
            int end = raw.indexOf('>');
            if (start != -1 && end != -1 && end > start) {
                return raw.substring(start + 1, end).trim();
            }
            return raw.trim();
        }
        return "unknown@example.com";
    }

    public String extractMessageId(Message message, String sender, String subject) {
        try {
            String[] headers = message.getHeader("Message-ID");
            if (headers != null && headers.length > 0 && headers[0] != null && !headers[0].isBlank()) {
                return headers[0].trim();
            }
        } catch (Exception ignored) {}

        // Fallback: deterministic SHA-256 hash of sender + subject + sentDate
        try {
            String dateStr = message.getSentDate() != null ? message.getSentDate().toString() : "";
            String raw = sender + "|" + subject + "|" + dateStr;
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(raw.getBytes(StandardCharsets.UTF_8));
            return "gen-" + HexFormat.of().formatHex(digest);
        } catch (Exception e) {
            return "gen-" + System.currentTimeMillis() + "-" + sender.hashCode();
        }
    }

    public String extractBody(Message message) throws Exception {
        return extractContentFromPart(message);
    }

    public String stripHtml(String html) {
        if (html == null || html.isBlank()) {
            return "";
        }

        String text = SCRIPT_PATTERN.matcher(html).replaceAll("");
        text = STYLE_PATTERN.matcher(text).replaceAll("");
        text = BR_PATTERN.matcher(text).replaceAll("\n");
        text = BLOCK_PATTERN.matcher(text).replaceAll("\n");
        text = TAG_PATTERN.matcher(text).replaceAll("");

        // Decode standard HTML entities
        text = text.replace("&nbsp;", " ")
                   .replace("&amp;", "&")
                   .replace("&lt;", "<")
                   .replace("&gt;", ">")
                   .replace("&quot;", "\"")
                   .replace("&#39;", "'")
                   .replace("&apos;", "'");

        text = MULTI_NEWLINE.matcher(text).replaceAll("\n\n");
        return text.trim();
    }

    private String extractContentFromPart(jakarta.mail.Part part) throws Exception {
        Object content = part.getContent();

        if (content instanceof Multipart mp) {
            String plainText = null;
            String htmlText = null;

            for (int i = 0; i < mp.getCount(); i++) {
                BodyPart bp = mp.getBodyPart(i);
                String bpType = bp.getContentType() != null ? bp.getContentType().toLowerCase() : "";

                if (bp.isMimeType("text/plain") || bpType.contains("text/plain")) {
                    Object bpContent = bp.getContent();
                    if (bpContent != null) {
                        plainText = bpContent.toString();
                        break; // Prefer plain text immediately
                    }
                } else if (bp.isMimeType("text/html") || bpType.contains("text/html")) {
                    if (htmlText == null) {
                        Object bpContent = bp.getContent();
                        if (bpContent != null) {
                            htmlText = stripHtml(bpContent.toString());
                        }
                    }
                } else if (bp.isMimeType("multipart/*") || bpType.contains("multipart")) {
                    String nested = extractContentFromPart(bp);
                    if (nested != null && !nested.isBlank()) {
                        plainText = nested;
                        break;
                    }
                }
            }

            if (plainText != null && !plainText.isBlank()) return plainText;
            if (htmlText != null && !htmlText.isBlank()) return htmlText;
        }

        if (content instanceof String str) {
            String contentType = part.getContentType() != null ? part.getContentType().toLowerCase() : "";
            if (part.isMimeType("text/html") || contentType.contains("text/html")) {
                return stripHtml(str);
            }
            if (part.isMimeType("text/plain") || contentType.contains("text/plain")) {
                return str;
            }
            // Fallback: if string contains HTML tags, strip them
            if (str.contains("<") && str.contains(">") && (str.contains("</") || str.contains("/>"))) {
                return stripHtml(str);
            }
            return str;
        }

        // Fallback for non-text attachments or input streams
        if (content instanceof InputStream is) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
        return content != null ? content.toString() : "";
    }
}
