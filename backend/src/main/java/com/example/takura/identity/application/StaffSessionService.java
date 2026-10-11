package com.example.takura.identity.application;

import com.example.takura.identity.domain.StaffPrincipal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.sql.Timestamp;
import java.util.Base64;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StaffSessionService {
    private final JdbcTemplate jdbc;
    private final Clock clock;
    private final SecureRandom random = new SecureRandom();
    private final Duration idleTimeout;
    private final Duration absoluteTimeout;
    private final Duration freshAuthenticationWindow;

    public StaffSessionService(JdbcTemplate jdbc, Clock clock,
            @Value("${takura.security.session.idle-timeout:PT30M}") Duration idleTimeout,
            @Value("${takura.security.session.absolute-timeout:PT8H}") Duration absoluteTimeout,
            @Value("${takura.security.session.fresh-authentication-window:PT5M}") Duration freshAuthenticationWindow) {
        this.jdbc = jdbc;
        this.clock = clock;
        this.idleTimeout = idleTimeout;
        this.absoluteTimeout = absoluteTimeout;
        this.freshAuthenticationWindow = freshAuthenticationWindow;
    }

    @Transactional
    public CreatedSession create(String issuer, String subject, String clientId, Instant authenticatedAt) {
        Instant now = clock.instant();
        if (authenticatedAt.isAfter(now.plusSeconds(30)) || authenticatedAt.isBefore(now.minus(freshAuthenticationWindow))) {
            throw new CredentialsExpiredException("Interactive authentication is not fresh");
        }
        IdentityRow identity = identityForUpdate(issuer, subject);
        if (!identity.active || !authenticatedAt.isAfter(identity.revocationBoundary)) {
            throw new CredentialsExpiredException("Identity is inactive or authentication predates revocation");
        }
        jdbc.update("UPDATE takura.staff_session SET revoked_at=? WHERE staff_identity_id=? AND revoked_at IS NULL",
                Timestamp.from(now), identity.id);
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String handle = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        Instant absoluteExpiry = authenticatedAt.plus(absoluteTimeout);
        jdbc.update("""
                INSERT INTO takura.staff_session(id,handle_hash,staff_identity_id,issuer,subject,client_id,
                  authenticated_at,created_at,last_interactive_at,absolute_expires_at)
                VALUES (?,?,?,?,?,?,?,?,?,?)
                """, UUID.randomUUID(), hash(handle), identity.id, issuer, subject, clientId,
                Timestamp.from(authenticatedAt), Timestamp.from(now), Timestamp.from(now), Timestamp.from(absoluteExpiry));
        return new CreatedSession(handle, now.plus(idleTimeout), absoluteExpiry);
    }

    @Transactional
    public StaffPrincipal verify(String handle, String issuer, String subject, String clientId, boolean interactive) {
        Instant now = clock.instant();
        List<SessionRow> rows = jdbc.query("""
                SELECT s.staff_identity_id,s.last_interactive_at,s.absolute_expires_at,s.revoked_at,i.active
                FROM takura.staff_session s JOIN takura.staff_identity i ON i.id=s.staff_identity_id
                WHERE s.handle_hash=? AND s.issuer=? AND s.subject=? AND s.client_id=?
                FOR UPDATE
                """, (rs, n) -> new SessionRow((UUID) rs.getObject(1), rs.getTimestamp(2).toInstant(),
                rs.getTimestamp(3).toInstant(), rs.getTimestamp(4) == null ? null : rs.getTimestamp(4).toInstant(),
                rs.getBoolean(5)), hash(handle), issuer, subject, clientId);
        if (rows.isEmpty()) throw new UsernameNotFoundException("Staff session not found");
        SessionRow session = rows.getFirst();
        if (!session.active || session.revokedAt != null || !now.isBefore(session.absoluteExpiresAt)
                || !now.isBefore(session.lastInteractiveAt.plus(idleTimeout))) {
            throw new CredentialsExpiredException("Staff session expired or revoked");
        }
        if (interactive) {
            jdbc.update("UPDATE takura.staff_session SET last_interactive_at=? WHERE handle_hash=?", Timestamp.from(now), hash(handle));
        }
        Set<String> roles = Set.copyOf(jdbc.queryForList(
                "SELECT role_code FROM takura.staff_role WHERE staff_identity_id=?", String.class, session.identityId));
        Set<String> teams = Set.copyOf(jdbc.queryForList(
                "SELECT team_code FROM takura.staff_team WHERE staff_identity_id=?", String.class, session.identityId));
        Set<String> operations = Set.copyOf(jdbc.queryForList(
                "SELECT operation_code FROM takura.staff_grant WHERE staff_identity_id=?", String.class, session.identityId));
        return new StaffPrincipal(session.identityId, issuer, subject, clientId, null, roles, teams, operations);
    }

    public void revoke(String handle) {
        jdbc.update("UPDATE takura.staff_session SET revoked_at=? WHERE handle_hash=? AND revoked_at IS NULL",
                Timestamp.from(clock.instant()), hash(handle));
    }

    private IdentityRow identityForUpdate(String issuer, String subject) {
        List<IdentityRow> rows = jdbc.query("SELECT id,active,revocation_boundary FROM takura.staff_identity WHERE issuer=? AND subject=? FOR UPDATE",
                (rs, n) -> new IdentityRow((UUID) rs.getObject(1), rs.getBoolean(2), rs.getTimestamp(3).toInstant()), issuer, subject);
        if (rows.isEmpty()) throw new UsernameNotFoundException("Federated subject is not provisioned");
        return rows.getFirst();
    }

    private static String hash(String value) {
        try {
            return java.util.HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.US_ASCII)));
        } catch (Exception exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    public record CreatedSession(String handle, Instant idleExpiresAt, Instant absoluteExpiresAt) {}
    private record IdentityRow(UUID id, boolean active, Instant revocationBoundary) {}
    private record SessionRow(UUID identityId, Instant lastInteractiveAt, Instant absoluteExpiresAt,
                              Instant revokedAt, boolean active) {}
}
