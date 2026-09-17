package com.resolvedesk.repository;

import com.resolvedesk.domain.ProcessedEmail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProcessedEmailRepository extends JpaRepository<ProcessedEmail, Long> {
    boolean existsByMessageId(String messageId);
    Optional<ProcessedEmail> findByMessageId(String messageId);
}
