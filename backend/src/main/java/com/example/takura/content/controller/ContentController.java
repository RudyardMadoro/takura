package com.example.takura.content.controller;

import com.example.takura.content.application.ContentService;
import com.example.takura.content.application.ContentService.CreateContent;
import com.example.takura.content.application.ContentService.Draft;
import com.example.takura.identity.domain.StaffPrincipal;
import com.example.takura.identity.controller.StaffRequestPrincipal;
import java.net.URI;
import java.time.Duration;
import java.util.List;
import java.util.UUID;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1")
public class ContentController {
    private final ContentService service;
    ContentController(ContentService service) { this.service = service; }
    @GetMapping("/services") Object services(@RequestParam(required=false) UUID cursor, @RequestParam(name="page_size", defaultValue="12") int size) { return service.list("SERVICE", null, cursor, size); }
    @GetMapping("/services/{slug}") ResponseEntity<?> service(@PathVariable String slug) { return detail("SERVICE", slug); }
    @GetMapping("/projects") Object projects(@RequestParam(required=false) String category, @RequestParam(required=false) UUID cursor, @RequestParam(name="page_size", defaultValue="12") int size) { return service.list("PROJECT", category, cursor, size); }
    @GetMapping("/projects/{slug}") ResponseEntity<?> project(@PathVariable String slug) { return detail("PROJECT", slug); }
    @GetMapping(value="/sitemap.xml", produces=MediaType.APPLICATION_XML_VALUE) ResponseEntity<String> sitemap() {
        StringBuilder xml = new StringBuilder("<?xml version=\"1.0\" encoding=\"UTF-8\"?><urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">");
        for (String type : List.of("SERVICE", "PROJECT")) {
            UUID cursor = null;
            do {
                var page = service.list(type, null, cursor, 12);
                for (var item : page.items()) xml.append("<url><loc>https://example.invalid/").append(type.toLowerCase()).append("s/").append(item.slug()).append("</loc></url>");
                cursor = page.nextCursor();
            } while (cursor != null);
        }
        return ResponseEntity.ok().cacheControl(CacheControl.maxAge(Duration.ofSeconds(60)).cachePublic()).body(xml.append("</urlset>").toString());
    }
    @GetMapping("/admin/content") Object adminList(@StaffRequestPrincipal StaffPrincipal actor) { return service.listAdmin(actor); }
    @GetMapping("/admin/content/{id}") Object adminDetail(@StaffRequestPrincipal StaffPrincipal actor, @PathVariable UUID id) { return service.getAdmin(actor, id); }
    @PostMapping("/admin/content") ResponseEntity<?> create(@StaffRequestPrincipal StaffPrincipal actor, @RequestBody CreateContent request) { var created = service.create(actor, request); return ResponseEntity.created(URI.create("/api/v1/admin/content/" + created.id())).eTag(quoted(created.currentRevision())).body(created); }
    @PutMapping("/admin/content/{id}") ResponseEntity<Void> revise(@StaffRequestPrincipal StaffPrincipal actor, @PathVariable UUID id, @RequestHeader(value="If-Match", required=false) String match, @RequestParam(defaultValue="false") boolean publish, @RequestBody Draft draft) { long next = service.revise(actor, id, precondition(match), draft, publish); return ResponseEntity.noContent().eTag(quoted(next)).build(); }
    @DeleteMapping("/admin/content/{id}") ResponseEntity<Void> archive(@StaffRequestPrincipal StaffPrincipal actor, @PathVariable UUID id, @RequestHeader(value="If-Match", required=false) String match) { long next = service.archive(actor, id, precondition(match)); return ResponseEntity.noContent().eTag(quoted(next)).build(); }
    private ResponseEntity<?> detail(String type, String slug) {
        try { var item = service.get(type, slug); return ResponseEntity.ok().cacheControl(CacheControl.maxAge(Duration.ofSeconds(60)).cachePublic()).eTag(quoted(item.revision())).body(item); }
        catch (ContentService.RedirectException redirect) { return ResponseEntity.status(308).location(URI.create("/" + type.toLowerCase() + "s/" + redirect.slug)).build(); }
    }
    private static long precondition(String value) {
        if (value == null) throw new ResponseStatusException(HttpStatus.PRECONDITION_REQUIRED, "If-Match is required");
        try { return Long.parseLong(value.replace("\"", "")); } catch (NumberFormatException invalid) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "If-Match is invalid", invalid); }
    }
    private static String quoted(long revision) { return "\"" + revision + "\""; }
}
