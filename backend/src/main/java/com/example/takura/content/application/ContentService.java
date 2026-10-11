package com.example.takura.content.application;

import com.example.takura.identity.application.PermissionService;
import com.example.takura.identity.domain.StaffPrincipal;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ContentService {
    private static final Pattern SLUG = Pattern.compile("^[a-z0-9]+(?:-[a-z0-9]+)*$");
    private static final Set<String> TYPES = Set.of("PAGE", "SERVICE", "PROJECT", "POLICY", "FAQ");
    private static final Set<String> RESERVED = Set.of("admin", "api", "auth", "quote", "request-quote", "boards", "hardware", "privacy", "terms");
    private static final PolicyFactory HTML = new HtmlPolicyBuilder()
            .allowElements("p", "h2", "h3", "ul", "ol", "li", "strong", "em", "blockquote", "a", "br")
            .allowUrlProtocols("https").allowAttributes("href").onElements("a")
            .allowAttributes("title").globally().requireRelNofollowOnLinks().toFactory();
    private static final String SELECT_PUBLIC = """
            SELECT e.id,e.slug,r.title,r.summary,r.body_html,e.featured,e.published_at,r.metadata::text,r.revision
            FROM takura.content_entry e JOIN takura.content_revision r
              ON r.entry_id=e.id AND r.revision=e.published_revision
            """;
    private final JdbcTemplate jdbc;
    private final PermissionService permissions;
    private final Clock clock;
    private final ObjectMapper json;

    public ContentService(JdbcTemplate jdbc, PermissionService permissions, Clock clock, ObjectMapper json) {
        this.jdbc = jdbc; this.permissions = permissions; this.clock = clock; this.json = json;
    }

    public PublicPage list(String type, String category, UUID cursor, int requestedSize) {
        requireType(type);
        int size = Math.min(Math.max(requestedSize, 1), 12);
        StringBuilder sql = new StringBuilder(SELECT_PUBLIC)
                .append(" WHERE e.content_type=? AND e.state='PUBLISHED'");
        List<Object> parameters = new ArrayList<>();
        parameters.add(type);
        if (category != null) {
            sql.append(" AND e.category_code=?");
            parameters.add(category);
        }
        if (cursor != null) {
            sql.append("""
                     AND EXISTS (SELECT 1 FROM takura.content_entry boundary WHERE boundary.id=? AND
                       (e.featured < boundary.featured OR (e.featured=boundary.featured AND
                        (e.published_at,e.id)<(boundary.published_at,boundary.id))))
                    """);
            parameters.add(cursor);
        }
        sql.append(" ORDER BY e.featured DESC,e.published_at DESC,e.id DESC LIMIT ?");
        parameters.add(size + 1);
        List<PublicContent> items = jdbc.query(sql.toString(), (rs, row) -> mapPublic(rs), parameters.toArray());
        UUID next = items.size() > size ? items.get(size - 1).id() : null;
        if (items.size() > size) items = List.copyOf(items.subList(0, size));
        return new PublicPage(items, next, size);
    }

    public PublicContent get(String type, String slug) {
        requireType(type);
        List<PublicContent> rows = jdbc.query(SELECT_PUBLIC + " WHERE e.content_type=? AND e.slug=? AND e.state='PUBLISHED'", (rs, row) -> mapPublic(rs), type, slug);
        if (!rows.isEmpty()) return rows.getFirst();
        String redirect = jdbc.query("SELECT e.slug FROM takura.content_slug_redirect d JOIN takura.content_entry e ON e.id=d.entry_id WHERE d.content_type=? AND d.old_slug=? AND e.state='PUBLISHED'", rs -> rs.next() ? rs.getString(1) : null, type, slug);
        if (redirect != null) throw new RedirectException(redirect);
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Published content was not found");
    }

    public List<AdminContent> listAdmin(StaffPrincipal actor) {
        permissions.require(actor, "content:write");
        return jdbc.query("SELECT id,content_type,slug,state,current_revision,published_revision,featured,category_code,published_at FROM takura.content_entry ORDER BY content_type,slug", (rs, row) -> new AdminContent((UUID) rs.getObject("id"), rs.getString("content_type"), rs.getString("slug"), rs.getString("state"), rs.getLong("current_revision"), (Long) rs.getObject("published_revision"), rs.getBoolean("featured"), rs.getString("category_code"), timestamp(rs, "published_at")));
    }

    public AdminEditor getAdmin(StaffPrincipal actor, UUID id) {
        permissions.require(actor, "content:write");
        List<AdminEditor> rows = jdbc.query("""
                SELECT e.id,e.content_type,e.slug,e.state,e.current_revision,e.published_revision,e.featured,
                       e.category_code,r.title,r.summary,r.body_html,r.metadata::text
                FROM takura.content_entry e JOIN takura.content_revision r
                  ON r.entry_id=e.id AND r.revision=e.current_revision WHERE e.id=?
                """, (rs, row) -> new AdminEditor((UUID) rs.getObject(1), rs.getString(2), rs.getString(3),
                rs.getString(4), rs.getLong(5), (Long) rs.getObject(6), rs.getBoolean(7), rs.getString(8),
                rs.getString(9), rs.getString(10), rs.getString(11), rs.getString(12)), id);
        if (rows.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Content was not found");
        return rows.getFirst();
    }

    @Transactional
    public AdminContent create(StaffPrincipal actor, CreateContent request) {
        permissions.require(actor, "content:write"); requireType(request.contentType()); validate(request.draft());
        UUID id = UUID.randomUUID(); Instant now = clock.instant();
        try {
            jdbc.update("INSERT INTO takura.content_entry(id,content_type,slug,state,current_revision,featured,category_code,created_at) VALUES(?,?,?,'DRAFT',1,?,?,?)", id, request.contentType(), request.draft().slug(), request.featured(), request.categoryCode(), Timestamp.from(now));
            insertRevision(id, 1, request.draft(), actor.identityId(), now);
        } catch (DataIntegrityViolationException conflict) { throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug is already in use", conflict); }
        return new AdminContent(id, request.contentType(), request.draft().slug(), "DRAFT", 1, null, request.featured(), request.categoryCode(), null);
    }

    @Transactional
    public long revise(StaffPrincipal actor, UUID id, long expected, Draft draft, boolean publish) {
        permissions.require(actor, "content:write"); if (publish) permissions.require(actor, "content:publish"); validate(draft);
        Map<String, Object> current;
        try { current = jdbc.queryForMap("SELECT slug,content_type,current_revision FROM takura.content_entry WHERE id=? FOR UPDATE", id); }
        catch (org.springframework.dao.EmptyResultDataAccessException missing) { throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Content was not found", missing); }
        long revision = ((Number) current.get("current_revision")).longValue();
        if (revision != expected) throw new ResponseStatusException(HttpStatus.PRECONDITION_FAILED);
        String oldSlug = (String) current.get("slug"); String type = (String) current.get("content_type");
        if (!oldSlug.equals(draft.slug())) preserveRedirect(type, oldSlug, draft.slug(), id);
        if (publish) requirePublicationClearance(id);
        long next = revision + 1; Instant now = clock.instant();
        try {
            jdbc.update("UPDATE takura.content_entry SET slug=?,current_revision=?,state=CASE WHEN ? THEN 'PUBLISHED' ELSE state END,published_revision=CASE WHEN ? THEN ? ELSE published_revision END,published_at=CASE WHEN ? THEN ? ELSE published_at END WHERE id=?", draft.slug(), next, publish, publish, next, publish, Timestamp.from(now), id);
            insertRevision(id, next, draft, actor.identityId(), now);
        } catch (DataIntegrityViolationException conflict) { throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug is already in use", conflict); }
        return next;
    }

    @Transactional
    public long archive(StaffPrincipal actor, UUID id, long expected) {
        permissions.require(actor, "content:publish");
        int changed = jdbc.update("UPDATE takura.content_entry SET state='ARCHIVED',current_revision=current_revision+1 WHERE id=? AND current_revision=?", id, expected);
        if (changed == 0) throw new ResponseStatusException(HttpStatus.PRECONDITION_FAILED);
        return expected + 1;
    }

    private void preserveRedirect(String type, String oldSlug, String newSlug, UUID id) {
        Boolean loops = jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM takura.content_slug_redirect WHERE content_type=? AND old_slug=? AND entry_id<>?)", Boolean.class, type, newSlug, id);
        if (Boolean.TRUE.equals(loops)) throw new ResponseStatusException(HttpStatus.CONFLICT, "Historical slug would create a redirect loop");
        jdbc.update("INSERT INTO takura.content_slug_redirect(content_type,old_slug,entry_id,created_at) VALUES(?,?,?,?) ON CONFLICT DO NOTHING", type, oldSlug, id, Timestamp.from(clock.instant()));
    }
    private void requirePublicationClearance(UUID id) {
        Integer blocked = jdbc.queryForObject("SELECT count(*) FROM takura.content_media_reference r JOIN takura.media_asset m ON m.id=r.media_asset_id WHERE r.entry_id=? AND (m.visibility<>'PUBLIC' OR m.scan_status<>'CLEAN' OR m.publication_clearance<>'CLEARED' OR m.demo_only)", Integer.class, id);
        if (blocked != null && blocked > 0) throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Content contains media that is not cleared for production publication");
    }
    private void insertRevision(UUID id, long revision, Draft draft, UUID actor, Instant changedAt) {
        jdbc.update("INSERT INTO takura.content_revision(entry_id,revision,title,summary,body_html,metadata,changed_by,changed_at) VALUES(?,?,?,?,?,CAST(? AS jsonb),?,?)", id, revision, draft.title().strip(), draft.summary().strip(), sanitizeHtml(draft.bodyHtml()), normaliseJson(draft.metadataJson()), actor, Timestamp.from(changedAt));
    }
    private String normaliseJson(String value) {
        try { return json.writeValueAsString(json.readTree(value)); }
        catch (JsonProcessingException invalid) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "metadata_json must be valid JSON", invalid); }
    }
    private static void validate(Draft draft) {
        if (draft == null || draft.slug() == null || draft.slug().length() < 3 || draft.slug().length() > 100 || !SLUG.matcher(draft.slug()).matches() || RESERVED.contains(draft.slug())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or reserved slug");
        if (blank(draft.title()) || draft.title().length() > 160 || blank(draft.summary()) || draft.summary().length() > 320 || blank(draft.bodyHtml())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Required editorial fields are invalid");
    }
    private static boolean blank(String value) { return value == null || value.isBlank(); }
    static String sanitizeHtml(String value) { return HTML.sanitize(value); }
    private static void requireType(String type) { if (!TYPES.contains(type)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported content type"); }
    private static Instant timestamp(ResultSet rs, String name) throws SQLException { var value = rs.getTimestamp(name); return value == null ? null : value.toInstant(); }
    private static PublicContent mapPublic(ResultSet rs) throws SQLException { return new PublicContent((UUID) rs.getObject(1), rs.getString(2), rs.getString(3), rs.getString(4), rs.getString(5), rs.getBoolean(6), rs.getTimestamp(7).toInstant(), rs.getString(8), rs.getLong(9)); }

    public record PublicPage(List<PublicContent> items, UUID nextCursor, int pageSize) {}
    public record PublicContent(UUID id, String slug, String title, String summary, String bodyHtml, boolean featured, Instant publishedAt, String metadataJson, long revision) {}
    public record AdminContent(UUID id, String contentType, String slug, String state, long currentRevision, Long publishedRevision, boolean featured, String categoryCode, Instant publishedAt) {}
    public record AdminEditor(UUID id, String contentType, String slug, String state, long currentRevision,
                              Long publishedRevision, boolean featured, String categoryCode, String title,
                              String summary, String bodyHtml, String metadataJson) {}
    public record Draft(String slug, String title, String summary, String bodyHtml, String metadataJson) {}
    public record CreateContent(String contentType, boolean featured, String categoryCode, Draft draft) {}
    public static class RedirectException extends RuntimeException { public final String slug; public RedirectException(String slug) { this.slug = slug; } }
}
