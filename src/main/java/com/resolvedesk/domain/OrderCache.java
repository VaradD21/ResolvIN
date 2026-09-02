package com.resolvedesk.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.Map;

@Entity
@Table(name = "orders_cache",
       uniqueConstraints = @UniqueConstraint(columnNames = {"brand_id", "external_order_id"}))
@Getter @Setter
public class OrderCache {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @Column(name = "external_order_id", nullable = false)
    private String externalOrderId;

    @Column(name = "customer_email", nullable = false)
    private String customerEmail;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> data;

    @Column(name = "fetched_at", nullable = false, updatable = false,
            columnDefinition = "TIMESTAMPTZ DEFAULT now()")
    private OffsetDateTime fetchedAt;

    @PrePersist
    void prePersist() {
        if (fetchedAt == null) fetchedAt = OffsetDateTime.now();
    }
}
