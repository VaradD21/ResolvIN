package com.resolvedesk.repository;

import com.resolvedesk.domain.Escalation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface EscalationRepository extends JpaRepository<Escalation, Long> {

    @Query("SELECT e FROM Escalation e JOIN FETCH e.ticket t WHERE e.resolvedAt IS NULL ORDER BY e.createdAt ASC")
    List<Escalation> findAllUnresolved();
}
