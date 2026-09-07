package com.resolvedesk.llm;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "resolvedesk.llm")
public record LlmProperties(
        String provider,   // gemini | openai | ...
        String apiKey,
        String model,
        String baseUrl     // optional; overrides default endpoint
) {}
