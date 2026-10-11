package com.example.takura.identity.infrastructure;

import java.time.Clock;
import java.util.UUID;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@ConditionalOnProperty(name="takura.security.bootstrap.enabled", havingValue="true")
class AdministratorBootstrap implements ApplicationRunner {
    private final JdbcTemplate jdbc; private final Clock clock; private final String issuer; private final String subject; private final String label;
    AdministratorBootstrap(JdbcTemplate jdbc, Clock clock,
            @Value("${takura.security.bootstrap.issuer:}") String issuer,
            @Value("${takura.security.bootstrap.subject:}") String subject,
            @Value("${takura.security.bootstrap.display-label:Approved bootstrap administrator}") String label) {
        this.jdbc=jdbc;this.clock=clock;this.issuer=issuer;this.subject=subject;this.label=label;
    }
    @Override @Transactional public void run(ApplicationArguments args) {
        if (issuer.isBlank()||subject.isBlank()) throw new IllegalStateException("Bootstrap issuer and subject are required");
        Integer existing=jdbc.queryForObject("SELECT count(*) FROM takura.staff_identity",Integer.class);
        if(existing!=null&&existing>0) throw new IllegalStateException("Bootstrap is one-time and identity records already exist");
        UUID id=UUID.randomUUID();var now=clock.instant();
        jdbc.update("INSERT INTO takura.staff_identity(id,issuer,subject,display_label,active,provisioned_at,revocation_boundary) VALUES(?,?,?,?,true,?,?)",id,issuer,subject,label.replaceAll("[<>]",""),now,now.minusMillis(1));
        jdbc.update("INSERT INTO takura.staff_role(staff_identity_id,role_code) VALUES(?,'ADMINISTRATOR')",id);
        for(String operation:new String[]{"staff_access:read","staff_access:write","settings:read","settings:write"})
            jdbc.update("INSERT INTO takura.staff_grant(id,staff_identity_id,operation_code,granted_at) VALUES(?,?,?,?)",UUID.randomUUID(),id,operation,now);
        jdbc.update("INSERT INTO takura.security_audit_event(id,actor_identity_id,target_type,target_id,action,occurred_at) VALUES(?,?,?,?,?,?)",UUID.randomUUID(),id,"STAFF_IDENTITY",id.toString(),"FIRST_ADMIN_BOOTSTRAPPED",now);
    }
}
