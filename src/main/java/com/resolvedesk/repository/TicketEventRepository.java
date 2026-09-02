package com.resolvedesk.repository;

import com.resolvedesk.domain.TicketEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TicketEventRepository extends JpaRepository<TicketEvent, Long> {
}
