package com.resolvedesk.web;

import com.resolvedesk.repository.BrandRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandRepository brands;

    public record BrandResponse(
        Long id,
        String name,
        String slug,
        Map<String, Object> policy,
        OffsetDateTime createdAt
    ) {}

    @GetMapping
    public List<BrandResponse> list() {
        return brands.findAll().stream()
            .map(b -> new BrandResponse(
                b.getId(),
                b.getName(),
                b.getSlug(),
                b.getPolicy(),
                b.getCreatedAt()
            ))
            .toList();
    }
}
