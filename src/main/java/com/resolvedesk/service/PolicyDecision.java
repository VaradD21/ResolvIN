package com.resolvedesk.service;

public record PolicyDecision(boolean eligible, PolicyAction action, String reason) {

    static PolicyDecision ineligible(String reason) {
        return new PolicyDecision(false, PolicyAction.NONE, reason);
    }
}
