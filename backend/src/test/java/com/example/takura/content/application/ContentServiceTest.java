package com.example.takura.content.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;

import com.example.takura.content.application.ContentService.Draft;
import com.example.takura.identity.application.PermissionService;
import com.example.takura.identity.domain.StaffPrincipal;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;

class ContentServiceTest {
    private final ContentService service = new ContentService(mock(JdbcTemplate.class), new PermissionService(),
            Clock.fixed(Instant.parse("2026-10-11T08:00:00Z"), ZoneOffset.UTC), new ObjectMapper());

    @Test
    void sanitizerKeepsEditorialMarkupAndRemovesActiveContent() {
        String cleaned = ContentService.sanitizeHtml("<p onclick=\"steal()\">Safe <strong>copy</strong></p><script>alert(1)</script>");
        assertThat(cleaned).contains("<p>", "<strong>copy</strong>").doesNotContain("onclick", "script", "alert");
    }

    @Test
    void publishingRequiresSeparatePublishGrantBeforeDatabaseAccess() {
        StaffPrincipal editor = principal(Set.of("content:write"));
        Draft draft = new Draft("valid-slug", "Title", "Summary", "<p>Body</p>", "{}");
        assertThatThrownBy(() -> service.revise(editor, UUID.randomUUID(), 1, draft, true))
                .isInstanceOf(AccessDeniedException.class);
    }

    private static StaffPrincipal principal(Set<String> operations) {
        return new StaffPrincipal(UUID.randomUUID(), "issuer", "subject", "client", Instant.now(),
                Set.of("CONTENT_EDITOR"), Set.of(), operations);
    }
}
