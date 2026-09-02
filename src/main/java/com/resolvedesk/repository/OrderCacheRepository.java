package com.resolvedesk.repository;

import com.resolvedesk.domain.OrderCache;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderCacheRepository extends JpaRepository<OrderCache, Long> {
}
