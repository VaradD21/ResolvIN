package com.resolvedesk;

import com.resolvedesk.domain.Brand;
import com.resolvedesk.llm.LlmClient;
import com.resolvedesk.repository.BrandRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import org.springframework.test.context.TestPropertySource;

import java.util.Map;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
// ponytail: mock LLM config to avoid missing API key errors in tests
@TestPropertySource(properties = {
    "resolvedesk.llm.provider=gemini",
    "resolvedesk.llm.api-key=dummy"
})
class TicketControllerIT {

    @Autowired TestRestTemplate http;
    @Autowired BrandRepository brandRepo;

    @MockBean LlmClient llm;

    @Test
    void createTicket_persistsAndClassifiesAsync() {
        // Stub the LLM to return WISMO
        String rawJson = "{\"category\":\"WISMO\", \"confidence\":0.95, \"extractedOrderId\":\"123\", \"extractedIntent\":\"where is it\"}";
        when(llm.complete(anyString(), anyString())).thenReturn(rawJson);

        // seed a brand
        Brand brand = new Brand();
        brand.setName("Acme Clothing");
        brand.setSlug("acme");
        brand = brandRepo.save(brand);

        Map<String, Object> body = Map.of(
            "customerEmail", "customer@example.com",
            "subject", "Where is my order?",
            "body", "I haven't received my package yet.",
            "brandId", brand.getId()
        );

        ResponseEntity<Map> response = http.postForEntity("/tickets", body, Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).containsEntry("status", "NEW");
        assertThat(response.getBody()).containsKey("id");

        Long id = ((Number) response.getBody().get("id")).longValue();

        // wait for async classification
        await().atMost(5, TimeUnit.SECONDS).untilAsserted(() -> {
            ResponseEntity<Map> fetched = http.getForEntity("/tickets/" + id, Map.class);
            assertThat(fetched.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(fetched.getBody()).containsEntry("category", "WISMO");
        });
    }
}
