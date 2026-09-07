package com.resolvedesk.llm;

/**
 * Pluggable LLM interface. One implementation per provider.
 * Implementors must be thread-safe (Spring singleton scope).
 */
public interface LlmClient {
    /**
     * Send a prompt and return the model's text response.
     *
     * @param systemPrompt instructions / persona for the model
     * @param userPrompt   the actual input text
     * @return raw text response from the model
     */
    String complete(String systemPrompt, String userPrompt);
}
