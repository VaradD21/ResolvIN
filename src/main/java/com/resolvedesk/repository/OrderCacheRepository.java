package com.resolvedesk.repository;

import com.resolvedesk.domain.OrderCache;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrderCacheRepository extends JpaRepository<OrderCache, Long> {
    Optional<OrderCache> findByBrandIdAndExternalOrderId(Long brandId, String externalOrderId);
}
