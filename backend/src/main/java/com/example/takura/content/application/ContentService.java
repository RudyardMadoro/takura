package com.example.takura.content.application;

import com.example.takura.identity.application.PermissionService;
import com.example.takura.identity.domain.StaffPrincipal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ContentService {
    private static final Pattern SLUG = Pattern.compile("^[a-z0-9]+(?:-[a-z0-9]+)*$");
    private static final Set<String> RESERVED = Set.of("admin", "api", "quote", "request-quote", "boards", "hardware", "privacy", "terms");
    private static final String SELECT = "SELECT e.id,e.slug,r.title,r.summary,r.body_html,e.featured,e.published_at,r.metadata::text FROM takura.content_entry e JOIN takura.content_revision r ON r.entry_id=e.id AND r.revision=e.published_revision ";
    private final JdbcTemplate jdbc;
    private final PermissionService permissions;
    private final Clock clock;

    public ContentService(JdbcTemplate jdbc, PermissionService permissions, Clock clock) {
        this.jdbc = jdbc; this.permissions = permissions; this.clock = clock;
    }

    public List<PublicContent> list(String type, String category, UUID cursor, int size) {
        int limit = Math.min(Math.max(size, 1), 12);
        String sql = SELECT + "WHERE e.content_type=? AND e.state='PUBLISHED' AND (? IS NULL OR e.category_code=?) AND (? IS NULL OR e.id<?) ORDER BY e.featured DESC,e.published_at DESC,e.id DESC LIMIT ?";
        return jdbc.query(sql, (rs, row) -> map(rs), type, category, category, cursor, cursor, limit);
    }

    public PublicContent get(String type, String slug) {
        List<PublicContent> rows = jdbc.query(SELECT + "WHERE e.content_type=? AND e.slug=? AND e.state='PUBLISHED'", (rs, row) -> map(rs), type, slug);
        if (!rows.isEmpty()) return rows.getFirst();
        String redirect = jdbc.query("SELECT e.slug FROM takura.content_slug_redirect d JOIN takura.content_entry e ON e.id=d.entry_id WHERE d.content_type=? AND d.old_slug=? AND e.state='PUBLISHED'", rs -> rs.next() ? rs.getString(1) : null, type, slug);
        if (redirect != null) throw new RedirectException(redirect);
        throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }

    @Transactional
    public void revise(StaffPrincipal actor, UUID id, long expected, Draft draft, boolean publish) {
        permissions.require(actor, "content:write");
        if (publish) permissions.require(actor, "content:publish");
        validate(draft);
        Map<String, Object> current = jdbc.queryForMap("SELECT slug,content_type FROM takura.content_entry WHERE id=? FOR UPDATE", id);
        String oldSlug = (String) current.get("slug");
        String type = (String) current.get("content_type");
        if (!oldSlug.equals(draft.slug())) {
            Boolean historical = jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM takura.content_slug_redirect WHERE content_type=? AND old_slug=?)", Boolean.class, type, draft.slug());
            if (Boolean.TRUE.equals(historical)) throw new ResponseStatusException(HttpStatus.CONFLICT, "Historical slug cannot create a redirect loop");
            jdbc.update("INSERT INTO takura.content_slug_redirect(content_type,old_slug,entry_id,created_at) VALUES(?,?,?,?) ON CONFLICT DO NOTHING", type, oldSlug, id, clock.instant());
        }
        int changed = jdbc.update("UPDATE takura.content_entry SET slug=?,current_revision=current_revision+1,state=CASE WHEN ? THEN 'PUBLISHED' ELSE state END,published_revision=CASE WHEN ? THEN current_revision+1 ELSE published_revision END,published_at=CASE WHEN ? THEN ? ELSE published_at END WHERE id=? AND current_revision=?", draft.slug(), publish, publish, publish, clock.instant(), id, expected);
        if (changed == 0) throw new ResponseStatusException(HttpStatus.PRECONDITION_FAILED);
        jdbc.update("INSERT INTO takura.content_revision(entry_id,revision,title,summary,body_html,metadata,changed_by,changed_at) VALUES(?,?,?,?,?,CAST(? AS jsonb),?,?)", id, expected + 1, draft.title(), draft.summary(), sanitize(draft.bodyHtml()), draft.metadataJson(), actor.identityId(), clock.instant());
    }

    private static void validate(Draft draft) {
        if (draft.slug() == null || draft.slug().length() < 3 || draft.slug().length() > 100 || !SLUG.matcher(draft.slug()).matches() || RESERVED.contains(draft.slug())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or reserved slug");
    }
    private static String sanitize(String html) { return html.replaceAll("(?is)<(script|style|iframe)[^>]*>.*?</\\1>", "").replaceAll("(?i) on[a-z]+\\s*=\\s*(['\"]).*?\\1", ""); }
    private static PublicContent map(ResultSet rs) throws SQLException { return new PublicContent((UUID) rs.getObject(1), rs.getString(2), rs.getString(3), rs.getString(4), rs.getString(5), rs.getBoolean(6), rs.getTimestamp(7).toInstant(), rs.getString(8)); }
    public record PublicContent(UUID id, String slug, String title, String summary, String bodyHtml, boolean featured, Instant publishedAt, String metadataJson) {}
    public record Draft(String slug, String title, String summary, String bodyHtml, String metadataJson) {}
    public static class RedirectException extends RuntimeException { public final String slug; public RedirectException(String slug) { this.slug = slug; } }
}
