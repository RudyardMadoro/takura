package com.example.takura.identity.controller;
import com.example.takura.identity.application.StaffSessionService;
import com.example.takura.identity.domain.StaffPrincipal;
import java.time.Instant;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/admin/session")
class StaffSessionController {
    private final StaffSessionService sessions;
    StaffSessionController(StaffSessionService sessions) { this.sessions = sessions; }
    @PostMapping ResponseEntity<?> create(JwtAuthenticationToken authentication) {
        Jwt jwt = authentication.getToken(); Number authTime = jwt.getClaim("auth_time");
        var created = sessions.create(jwt.getIssuer().toString(), jwt.getSubject(), jwt.getClaimAsString("client_id"),
                Instant.ofEpochSecond(authTime.longValue()));
        return ResponseEntity.status(201).body(Map.of("session_handle", created.handle(), "idle_expires_at", created.idleExpiresAt(),
                "absolute_expires_at", created.absoluteExpiresAt()));
    }
    @GetMapping Map<String, ?> current(@StaffRequestPrincipal StaffPrincipal principal) {
        return Map.of("identity_id", principal.identityId(), "roles", principal.roles(), "teams", principal.teams(), "operations", principal.operations());
    }
    @DeleteMapping ResponseEntity<Void> delete(@RequestHeader("X-Staff-Session") String handle) {
        sessions.revoke(handle); return ResponseEntity.noContent().build();
    }
}
