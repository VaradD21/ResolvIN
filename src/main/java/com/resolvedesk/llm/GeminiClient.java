package com.resolvedesk.llm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Gemini generateContent via plain HttpClient — no SDK needed.
 */
public class GeminiClient implements LlmClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiClient.class);
    private static final String DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

    private final String apiKey;
    private final String model;
    private final String baseUrl;
    private final HttpClient http;
    private final ObjectMapper mapper;

    public GeminiClient(String apiKey, String model, String baseUrl) {
        this.apiKey = apiKey;
        this.model = model != null ? model : "gemini-1.5-flash";
        this.baseUrl = baseUrl != null ? baseUrl : DEFAULT_BASE_URL;
        this.http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
        this.mapper = new ObjectMapper();
    }

    @Override
    public String complete(String systemPrompt, String userPrompt) {
        try {
            // Build Gemini generateContent request body
            var requestBody = Map.of(
                "system_instruction", Map.of("parts", List.of(Map.of("text", systemPrompt))),
                "contents", List.of(Map.of("parts", List.of(Map.of("text", userPrompt)))),
                "generationConfig", Map.of("temperature", 0.1)
            );

            String json = mapper.writeValueAsString(requestBody);
            String url = String.format("%s/models/%s:generateContent?key=%s", baseUrl, model, apiKey);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .timeout(Duration.ofSeconds(30))
                    .build();

            HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("Gemini API returned {}: {}", response.statusCode(), response.body());
                throw new RuntimeException("Gemini API error: " + response.statusCode());
            }

            // Extract text from candidates[0].content.parts[0].text
            JsonNode root = mapper.readTree(response.body());
            return root.path("candidates").path(0)
                    .path("content").path("parts").path(0)
                    .path("text").asText("");

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Gemini API call failed", e);
        }
    }
}
