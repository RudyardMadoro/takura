package com.example.takura.enquiries.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.example.takura.identity.domain.StaffPrincipal;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers(disabledWithoutDocker = true)
class LeadOperationsPostgresqlTest {
    @Container static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:17.11-alpine3.24");
    static JdbcTemplate jdbc;
    static TransactionTemplate transactions;
    LeadOperationsService service;
    UUID owner;
    UUID coordinator;
    UUID boards;
    UUID property;

    @BeforeAll static void migrate() {
        var dataSource = new DriverManagerDataSource(POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
        Flyway.configure().dataSource(dataSource).locations("classpath:db/migration").defaultSchema("takura").schemas("takura").load().migrate();
        jdbc = new JdbcTemplate(dataSource);
        transactions = new TransactionTemplate(new DataSourceTransactionManager(dataSource));
    }

    @BeforeEach void setUp() {
        jdbc.execute("TRUNCATE takura.operational_audit,takura.production_signoff,takura.cutting_specification_review,takura.assessment,takura.enquiry_state_transition,takura.enquiry_task,takura.enquiry_activity,takura.notification_outbox,takura.enquiry_record_grant,takura.enquiry_service_detail,takura.enquiry CASCADE");
        jdbc.execute("TRUNCATE takura.staff_grant,takura.staff_team,takura.staff_role,takura.staff_session,takura.staff_identity CASCADE");
        owner = identity("owner", true);
        coordinator = identity("coordinator", true);
        jdbc.update("INSERT INTO takura.staff_team(staff_identity_id,team_code) VALUES(?, 'BOARDS'),(?, 'PROPERTY')", coordinator, coordinator);
        boards = enquiry("DEMO-B-1", "BOARDS", coordinator, "NEW");
        property = enquiry("DEMO-P-1", "PROPERTY", coordinator, "NEW");
        service = new LeadOperationsService(jdbc, Clock.fixed(Instant.parse("2026-10-19T08:00:00Z"), ZoneOffset.UTC), new ObjectMapper(), new SimpleMeterRegistry(), "Africa/Johannesburg", "08:00", "17:00", "2026-12-25");
    }

    @Test void staleAssignmentIsRejectedAndInactiveOwnerCannotReceiveWork() {
        var actor = principal(owner, Set.of("BOARDS", "PROPERTY"), Set.of("enquiry:all:read", "enquiry:assign"));
        assertThat(service.assign(actor, boards, 0, new LeadOperationsService.Assignment(coordinator, "BOARDS", List.of()))).isEqualTo(1);
        assertThatThrownBy(() -> service.assign(actor, boards, 0, new LeadOperationsService.Assignment(coordinator, "BOARDS", List.of())))
                .isInstanceOfSatisfying(EnquiryService.DomainException.class, error -> assertThat(error.status).isEqualTo(HttpStatus.PRECONDITION_FAILED));
        jdbc.update("UPDATE takura.staff_identity SET active=false WHERE id=?", coordinator);
        assertThatThrownBy(() -> service.assign(actor, property, 1, new LeadOperationsService.Assignment(coordinator, "PROPERTY", List.of())))
                .isInstanceOfSatisfying(EnquiryService.DomainException.class, error -> assertThat(error.code).isEqualTo("OWNER_UNAVAILABLE"));
        assertThat(jdbc.queryForObject("SELECT owner_identity_id IS NULL FROM takura.enquiry WHERE id=?", Boolean.class, boards)).isTrue();
    }

    @Test void concurrentConfirmedAssessmentsPermitOnlyOneWithoutOverride() throws Exception {
        var actor = principal(owner, Set.of("BOARDS", "PROPERTY"), Set.of("enquiry:all:read", "assessment:manage"));
        var start = Instant.parse("2026-10-22T08:00:00Z");
        var command = new LeadOperationsService.AssessmentCommand(coordinator, "CONFIRMED", start, start.plusSeconds(3600), "REMOTE", null, null, false, false, null);
        var ready = new CountDownLatch(2);
        var go = new CountDownLatch(1);
        try (var pool = Executors.newVirtualThreadPerTaskExecutor()) {
            var first = pool.submit(() -> runAssessment(actor, boards, command, ready, go));
            var second = pool.submit(() -> runAssessment(actor, property, command, ready, go));
            ready.await(); go.countDown();
            var outcomes = List.of(first.get(), second.get());
            assertThat(outcomes).containsExactlyInAnyOrder("CREATED", "ASSESSMENT_CONFLICT");
        }
        assertThat(jdbc.queryForObject("SELECT count(*) FROM takura.assessment WHERE state='CONFIRMED'", Integer.class)).isEqualTo(1);
    }

    @Test void cancellationReturnsScheduledWorkflowToContactedAndRemindersDeduplicate() {
        var actor = principal(owner, Set.of("BOARDS"), Set.of("enquiry:all:read", "assessment:manage", "enquiry:operate"));
        jdbc.update("UPDATE takura.enquiry SET state='ASSESSMENT_SCHEDULED' WHERE id=?", boards);
        var start = Instant.parse("2026-10-22T08:00:00Z");
        var assessment = service.createAssessment(actor, boards, new LeadOperationsService.AssessmentCommand(coordinator, "PROPOSED", start, start.plusSeconds(3600), "REMOTE", null, null, false, false, null));
        service.updateAssessment(actor, boards, assessment.id(), 0, new LeadOperationsService.AssessmentUpdate("CANCELLED", null, "Synthetic cancellation"));
        assertThat(jdbc.queryForObject("SELECT state FROM takura.enquiry WHERE id=?", String.class, boards)).isEqualTo("CONTACTED");
        service.createTask(actor, boards, new LeadOperationsService.TaskCommand(coordinator, "Synthetic follow-up", Instant.parse("2026-10-19T07:00:00Z")));
        assertThat(service.scheduleReminders()).isEqualTo(1);
        assertThat(service.scheduleReminders()).isZero();
    }

    @Test void auditAndNotificationViewsApplyRecordScope() {
        var all = principal(owner, Set.of("BOARDS", "PROPERTY"), Set.of("enquiry:all:read", "enquiry:assign"));
        service.assign(all, boards, 0, new LeadOperationsService.Assignment(coordinator, "BOARDS", List.of()));
        service.assign(all, property, 0, new LeadOperationsService.Assignment(coordinator, "PROPERTY", List.of()));
        var boardsOnly = principal(coordinator, Set.of("BOARDS"), Set.of("enquiry:assigned:read", "audit:read"));
        assertThat(service.audit(boardsOnly, 100)).allMatch(event -> event.targetId().equals(boards));
        assertThat(service.notifications(boardsOnly, 100)).allMatch(event -> event.aggregateId().equals(boards));
    }

    private String runAssessment(StaffPrincipal actor, UUID enquiry, LeadOperationsService.AssessmentCommand command, CountDownLatch ready, CountDownLatch go) {
        try { ready.countDown(); go.await(); transactions.executeWithoutResult(status -> service.createAssessment(actor, enquiry, command)); return "CREATED"; }
        catch (EnquiryService.DomainException error) { return error.code; }
        catch (InterruptedException interrupted) { Thread.currentThread().interrupt(); return "INTERRUPTED"; }
    }

    private UUID identity(String subject, boolean active) {
        UUID id=UUID.randomUUID();
        jdbc.update("INSERT INTO takura.staff_identity(id,issuer,subject,display_label,active,provisioned_at,revocation_boundary) VALUES(?,'test-issuer',?,?,?,now(),now())", id, subject, "Synthetic "+subject, active);
        return id;
    }

    private UUID enquiry(String reference,String team,UUID assignee,String state) {
        UUID id=UUID.randomUUID();
        jdbc.update("INSERT INTO takura.enquiry(id,reference,state,team_code,owner_identity_id,full_name,email,preferred_contact,country_code,town_or_suburb,description,privacy_notice_version,privacy_acknowledged_at,created_at,first_response_due_at) VALUES(?,?,?,?,?,'Synthetic Person','person@example.invalid','EMAIL','ZA','Synthetic Area','Synthetic request','demo-v1',now(),now(),now()-interval '1 hour')",id,reference,state,team,assignee);
        return id;
    }

    private StaffPrincipal principal(UUID id,Set<String> teams,Set<String> operations) {
        return new StaffPrincipal(id,"test-issuer","actor","test-client",Instant.parse("2026-10-19T07:59:00Z"),Set.of(),teams,operations);
    }
}
