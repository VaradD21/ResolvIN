package com.resolvedesk.service;

import com.resolvedesk.llm.LlmClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class ClassifierServiceTest {

    @Mock LlmClient llm;
    ClassifierService svc;

    @BeforeEach
    void setUp() {
        ClassifierProperties props = new ClassifierProperties(List.of("lawyer", "sue", "consumer court"));
        svc = new ClassifierService(llm, props);
    }

    @Test
    void containsEscalationKeyword_matchesCaseInsensitive() {
        assertThat(svc.containsEscalationKeyword("I will call my lawyer", "Fix this")).isTrue();
        assertThat(svc.containsEscalationKeyword("Where is my order", "I am going to SuE you")).isTrue();
        assertThat(svc.containsEscalationKeyword("Help", "Taking you to Consumer Court")).isTrue();

        assertThat(svc.containsEscalationKeyword("Normal question", "Where is my stuff?")).isFalse();
    }
}
