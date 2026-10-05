package com.example.takura.identity.application;

public interface StaffIdentityPort {
    boolean isProvisioned(String issuer, String subject);
}
