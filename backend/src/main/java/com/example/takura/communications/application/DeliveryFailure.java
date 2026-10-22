package com.example.takura.communications.application;

public final class DeliveryFailure extends RuntimeException {
    public enum Kind { TRANSIENT, PERMANENT, UNKNOWN }
    private final Kind kind;
    private final String safeCode;

    public DeliveryFailure(Kind kind, String safeCode, Throwable cause) {
        super(safeCode, cause);
        this.kind = kind;
        this.safeCode = safeCode;
    }

    public Kind kind() { return kind; }
    public String safeCode() { return safeCode; }
}
