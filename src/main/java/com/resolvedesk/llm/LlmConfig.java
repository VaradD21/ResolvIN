package com.resolvedesk.llm;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(LlmProperties.class)
public class LlmConfig {

    @Bean
    public LlmClient llmClient(LlmProperties props) {
        if (props.apiKey() == null || props.apiKey().isBlank()) {
            throw new IllegalStateException("resolvedesk.llm.api-key must be set");
        }
        return switch (props.provider() != null ? props.provider().toLowerCase() : "") {
            case "gemini" -> new GeminiClient(props.apiKey(), props.model(), props.baseUrl());
            // ponytail: add case "openai" -> new OpenAiClient(...) when needed
            default -> throw new IllegalStateException(
                    "Unknown LLM provider: " + props.provider() + ". Supported: gemini");
        };
    }
}
