package com.resolvedesk;

import com.resolvedesk.domain.Brand;
import com.resolvedesk.repository.BrandRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class TicketControllerIT {

    @Autowired TestRestTemplate http;
    @Autowired BrandRepository brandRepo;

    @Test
    void createTicket_persistsWithStatusNew() {
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

        // verify GET round-trip
        Long id = ((Number) response.getBody().get("id")).longValue();
        ResponseEntity<Map> fetched = http.getForEntity("/tickets/" + id, Map.class);
        assertThat(fetched.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(fetched.getBody()).containsEntry("customerEmail", "customer@example.com");
    }
}
