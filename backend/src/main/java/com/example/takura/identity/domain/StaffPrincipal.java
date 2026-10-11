package com.example.takura.identity.domain;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public record StaffPrincipal(
        UUID identityId,
        String issuer,
        String subject,
        String clientId,
        Instant authenticatedAt,
        Set<String> roles,
        Set<String> teams,
        Set<String> operations) {
    public boolean may(String operation) {
        return operations.contains(operation);
    }
}
