package com.resolvedesk.repository;

import com.resolvedesk.domain.TicketEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketEventRepository extends JpaRepository<TicketEvent, Long> {
    List<TicketEvent> findByTicketIdOrderByCreatedAtDesc(Long ticketId);
}
