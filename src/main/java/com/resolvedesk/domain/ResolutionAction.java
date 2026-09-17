package com.resolvedesk.domain;

public enum ResolutionAction {
    APPROVED_REFUND,
    APPROVED_EXCHANGE,
    APPROVED_CANCEL,
    DENIED,
    NEEDS_MORE_INFO;

    public boolean isApproved() {
        return this == APPROVED_REFUND || this == APPROVED_EXCHANGE || this == APPROVED_CANCEL;
    }

    public String toActionType() {
        return switch (this) {
            case APPROVED_REFUND -> "REFUND";
            case APPROVED_EXCHANGE -> "EXCHANGE";
            case APPROVED_CANCEL -> "CANCEL";
            default -> throw new IllegalStateException("Not an approved action type: " + this);
        };
    }
}
