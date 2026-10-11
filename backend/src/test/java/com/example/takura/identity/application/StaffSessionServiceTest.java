package com.example.takura.identity.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.UUID;
import javax.sql.DataSource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.security.authentication.CredentialsExpiredException;

class StaffSessionServiceTest {
    private JdbcTemplate jdbc;
    private MutableClock clock;
    private StaffSessionService service;
    private final UUID identity = UUID.randomUUID();

    @BeforeEach
    void setup() {
        DataSource dataSource = new DriverManagerDataSource("jdbc:h2:mem:session" + UUID.randomUUID()
                + ";MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1", "sa", "");
        jdbc = new JdbcTemplate(dataSource);
        jdbc.execute("CREATE SCHEMA takura");
        jdbc.execute("CREATE TABLE takura.staff_identity(id uuid primary key,issuer varchar,subject varchar,active boolean,revocation_boundary timestamp with time zone)");
        jdbc.execute("CREATE TABLE takura.staff_session(id uuid primary key,handle_hash varchar,staff_identity_id uuid,issuer varchar,subject varchar,client_id varchar,authenticated_at timestamp with time zone,created_at timestamp with time zone,last_interactive_at timestamp with time zone,absolute_expires_at timestamp with time zone,revoked_at timestamp with time zone)");
        jdbc.execute("CREATE TABLE takura.staff_role(staff_identity_id uuid,role_code varchar)");
        jdbc.execute("CREATE TABLE takura.staff_team(staff_identity_id uuid,team_code varchar)");
        jdbc.execute("CREATE TABLE takura.staff_grant(staff_identity_id uuid,operation_code varchar)");
        clock = new MutableClock(Instant.parse("2026-10-11T08:00:00Z"));
        jdbc.update("INSERT INTO takura.staff_identity VALUES(?,?,?,true,?)", identity, "issuer", "subject", clock.instant().minusSeconds(1));
        service = new StaffSessionService(jdbc, clock, Duration.ofMinutes(30), Duration.ofHours(8), Duration.ofMinutes(5));
    }

    @Test
    void absoluteExpiryAnchorsToAuthenticationAndPollingDoesNotExtendIdle() {
        Instant authentication = clock.instant();
        var created = service.create("issuer", "subject", "client", authentication);
        assertThat(created.absoluteExpiresAt()).isEqualTo(authentication.plus(Duration.ofHours(8)));
        clock.advance(Duration.ofMinutes(29));
        service.verify(created.handle(), "issuer", "subject", "client", false);
        clock.advance(Duration.ofMinutes(2));
        assertThatThrownBy(() -> service.verify(created.handle(), "issuer", "subject", "client", false))
                .isInstanceOf(CredentialsExpiredException.class);
    }

    @Test
    void oldAuthenticationCannotRecreateSession() {
        Instant authentication = clock.instant();
        service.create("issuer", "subject", "client", authentication);
        clock.advance(Duration.ofMinutes(6));
        assertThatThrownBy(() -> service.create("issuer", "subject", "client", authentication))
                .isInstanceOf(CredentialsExpiredException.class);
    }

    static final class MutableClock extends Clock {
        private Instant now;
        MutableClock(Instant now) { this.now = now; }
        void advance(Duration duration) { now = now.plus(duration); }
        public ZoneId getZone() { return ZoneOffset.UTC; }
        public Clock withZone(ZoneId zone) { return this; }
        public Instant instant() { return now; }
    }
}
