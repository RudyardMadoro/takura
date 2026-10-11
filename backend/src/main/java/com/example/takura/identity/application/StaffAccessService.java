package com.example.takura.identity.application;

import com.example.takura.identity.domain.StaffPrincipal;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class StaffAccessService {
    private final JdbcTemplate jdbc; private final PermissionService permissions; private final Clock clock;
    public StaffAccessService(JdbcTemplate jdbc, PermissionService permissions, Clock clock) {
        this.jdbc=jdbc; this.permissions=permissions; this.clock=clock;
    }
    public List<StaffView> list(StaffPrincipal actor) {
        permissions.require(actor, "staff_access:read");
        return jdbc.query("SELECT id,issuer,subject,display_label,active,revision FROM takura.staff_identity ORDER BY display_label",
                (rs,n)->new StaffView((UUID)rs.getObject(1),rs.getString(2),rs.getString(3),rs.getString(4),rs.getBoolean(5),rs.getLong(6)));
    }
    @Transactional public StaffView provision(StaffPrincipal actor, StaffUpdate request) {
        permissions.require(actor,"staff_access:write"); validate(request);
        UUID id=UUID.randomUUID(); Instant now=clock.instant();
        jdbc.update("INSERT INTO takura.staff_identity(id,issuer,subject,display_label,active,provisioned_at,revocation_boundary) VALUES(?,?,?,?,?,?,?)",
                id,request.issuer,request.subject,safeLabel(request.displayLabel),request.active,now,now.minusMillis(1));
        replaceAssignments(id,request); audit(actor,id,"STAFF_PROVISIONED");
        return new StaffView(id,request.issuer,request.subject,safeLabel(request.displayLabel),request.active,0);
    }
    @Transactional public StaffView update(StaffPrincipal actor, UUID id, long expected, StaffUpdate request) {
        permissions.require(actor,"staff_access:write"); validate(request);
        Boolean wasActive=jdbc.queryForObject("SELECT active FROM takura.staff_identity WHERE id=?",Boolean.class,id);
        boolean hadAdmin=Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM takura.staff_role WHERE staff_identity_id=? AND role_code='ADMINISTRATOR')",Boolean.class,id));
        if (wasActive && hadAdmin && (!request.active || !request.roles.contains("ADMINISTRATOR"))) {
            Integer count=jdbc.queryForObject("SELECT count(*) FROM takura.staff_identity i JOIN takura.staff_role r ON r.staff_identity_id=i.id WHERE i.active AND r.role_code='ADMINISTRATOR'",Integer.class);
            if (count != null && count <= 1) throw new ResponseStatusException(HttpStatus.CONFLICT,"At least one active administrator is required");
        }
        int changed=jdbc.update("UPDATE takura.staff_identity SET display_label=?,active=?,revision=revision+1,revocation_boundary=CASE WHEN active<>? THEN ? ELSE revocation_boundary END,deactivated_at=CASE WHEN ? THEN NULL ELSE ? END WHERE id=? AND revision=?",
                safeLabel(request.displayLabel),request.active,request.active,clock.instant(),request.active,clock.instant(),id,expected);
        if(changed==0) throw new ResponseStatusException(HttpStatus.PRECONDITION_FAILED,"Staff revision is stale");
        replaceAssignments(id,request);
        jdbc.update("UPDATE takura.staff_session SET revoked_at=? WHERE staff_identity_id=? AND revoked_at IS NULL",clock.instant(),id);
        audit(actor,id,"STAFF_ACCESS_CHANGED");
        return jdbc.queryForObject("SELECT id,issuer,subject,display_label,active,revision FROM takura.staff_identity WHERE id=?",
                (rs,n)->new StaffView((UUID)rs.getObject(1),rs.getString(2),rs.getString(3),rs.getString(4),rs.getBoolean(5),rs.getLong(6)),id);
    }
    private void replaceAssignments(UUID id, StaffUpdate request) {
        jdbc.update("DELETE FROM takura.staff_role WHERE staff_identity_id=?",id);
        jdbc.update("DELETE FROM takura.staff_team WHERE staff_identity_id=?",id);
        jdbc.update("DELETE FROM takura.staff_grant WHERE staff_identity_id=?",id);
        request.roles.forEach(v->jdbc.update("INSERT INTO takura.staff_role(staff_identity_id,role_code) VALUES(?,?)",id,v));
        request.teams.forEach(v->jdbc.update("INSERT INTO takura.staff_team(staff_identity_id,team_code) VALUES(?,?)",id,v));
        request.operations.forEach(v->jdbc.update("INSERT INTO takura.staff_grant(id,staff_identity_id,operation_code,granted_at) VALUES(?,?,?,?)",UUID.randomUUID(),id,v,clock.instant()));
    }
    private void audit(StaffPrincipal actor,UUID target,String action){jdbc.update("INSERT INTO takura.security_audit_event(id,actor_identity_id,target_type,target_id,action,occurred_at) VALUES(?,?,?,?,?,?)",UUID.randomUUID(),actor.identityId(),"STAFF_IDENTITY",target.toString(),action,clock.instant());}
    private static void validate(StaffUpdate r){if(r.issuer==null||r.subject==null||r.displayLabel==null)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Issuer, subject and display label are required");}
    private static String safeLabel(String v){return v.replaceAll("[<>]","").strip();}
    public record StaffUpdate(String issuer,String subject,String displayLabel,boolean active,Set<String> roles,Set<String> teams,Set<String> operations){public StaffUpdate{roles=roles==null?Set.of():Set.copyOf(roles);teams=teams==null?Set.of():Set.copyOf(teams);operations=operations==null?Set.of():Set.copyOf(operations);}}
    public record StaffView(UUID id,String issuer,String subject,String displayLabel,boolean active,long revision){}
}
