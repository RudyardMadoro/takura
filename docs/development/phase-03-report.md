# Phase 03 report — Responsive public website and editorial content

Date: 2026-10-11  
Overall status: **PASS**

## Scope and source traceability

Implemented Phase 03 against Requirements v1.2, Specification v1.1, Architecture v1.0 and the Phase 01–02 reports. All three source documents were present under `docs/source/`; their extracted paragraphs and tables were reviewed. Mappings addressed: FR 01–06, 08–09, 21–22, 25–26; SP 02–05, 19–20, 26–27, 30, 32; AR 01, 16–17; T01, T18, T20, T23; AAT 01, 12.

The work stays within Angular public SSR/staff CSR, the Spring Boot modular monolith and PostgreSQL/Flyway. No Phase 04 catalogue, checkout, inventory, customer accounts or R2/R3 functionality was added.

## Files changed

- Public SSR application: `apps/public-web/src/app/app.config.ts`, `app.config.server.ts`, `app.routes.ts`, `app.routes.server.ts`, `content-api.service.ts`, `site-mode.ts`, `public.page.ts`, `server.ts` and `styles.scss`.
- Staff A07 editor: `apps/staff-web/src/app/app.routes.ts`, `staff.pages.ts` and `content-editor.page.ts`.
- Editorial API/domain: `backend/src/main/java/com/example/takura/content/`.
- Security/runtime prerequisite repairs: `StaffSessionService.java`, `LocalOidcProvider.java`, `SecurityConfiguration.java`, `WebConfiguration.java`, `ManagementConnectorConfiguration.java` and the management-context imports resource.
- Database/tests: `V4__content_media_clearance.sql`, `ContentServiceTest.java`, `PostgresqlMigrationTest.java`, `application.yaml`, `pom.xml`, `ops/demo-data.sql`, `playwright.config.ts` and `tests/e2e/phase-03-public.spec.ts`.
- Contract/generated client: `contracts/openapi.yaml` and `libs/api-client/src/generated/`.
- This report.

## Architecture decisions and handoff map

- Public pages P01–P07, P12–P14 and P18–P19 use shared header/footer, mobile disclosure navigation, service cards, process/proof sections, unavailable states and purposeful Phase-boundary CTAs. Board supply remains a primary offer; its catalogue is explicitly deferred.
- Public service/project lists and details are backed by published revisions only. Lists default/max to 12, use a featured/publication-time/ID keyset cursor, and projects accept an allowlisted category filter. The sitemap traverses every page of published entries.
- Angular server rendering fetches public APIs only. The Node SSR host exposes a narrowly allowlisted same-origin public API proxy, applies 60-second public caching, immutable hashed assets, global demo noindex headers and genuine 404/308 behavior for dynamic content. No private token or staff context enters SSR.
- Route resolvers now complete public API work before route activation on both server and browser. This fixes the discovered hydration defect that replaced correct SSR project content with a permanent loading state, while keeping transfer-safe public data only.
- A07 supports create, revise, publish and archive. `content:write` and `content:publish` are separate server-side checks. `If-Match` is mandatory (428 when absent, 412 when stale); ETags are quoted correctly.
- Entries retain immutable revisions and DRAFT/PUBLISHED/ARCHIVED state. Slugs are 3–100 characters, unique by type, checked against reserved paths, and old published slugs become loop-protected redirects.
- Rich HTML is stored only after OWASP allowlist sanitisation. API JSON uses external snake_case and the versioned OpenAPI client was regenerated.
- `MediaAsset` references are established without upload shortcuts. Publication rejects referenced media unless it is PUBLIC, CLEAN, CLEARED and not DEMO_ONLY. Upload, scanning and derivatives remain Phase 06 work.
- Three repository-owned, visibly synthetic owner-development concepts are seeded without addresses, tenant data, testimonials, accreditation or claims of client/completed work.
- Palette tokens remain replaceable charcoal/off-white/timber. Galleries reserve space and provide captions, alt text, reduced motion, keyboard activation, a modal dialog, Escape close, focus return, labelled navigation and a live position announcement.
- Typed `DEMO`, `STAGING` and `PRODUCTION` public-site modes control indexing and upcoming-route visibility. Production artifacts omit noindex, demonstration banners and non-functional navigation while retaining useful direct unavailable states.

## Migrations and configuration

- `V4__content_media_clearance.sql` adds constrained media references, publication-clearance attributes and indexes; Flyway now validates and applies four migrations.
- Demo Owner receives both editorial operations; ordinary Content Editor remains write-only. No provider groups become administrators.
- Global Jackson snake_case is enabled. Public cache defaults to 60 seconds. Preview/demo responses are noindex and real contact actions remain disabled.
- `TAKURA_PUBLIC_SITE_MODE` defaults to `DEMO` and must be set at build and runtime for `STAGING` or `PRODUCTION`; static prerendered pages intentionally capture the build mode. `TAKURA_API_ORIGIN` remains the server-only public API origin.
- Angular 22.2.1/TypeScript 6.0.2/Node 24.19 and Spring Boot 3.5.16/Java 21 remain pinned. Official compatibility was checked at kickoff; no version change was required.
- No credentials, paid infrastructure, external account, production deployment, live data or real message was created or changed.

## Prerequisite defects repaired

- The Phase 02 local OIDC controller lacked controller registration and was then visible outside its guarded local profile. It is now registered only when both the `local` profile and explicit local-provider flag are active.
- PostgreSQL could not infer JDBC types for raw `Instant` session/content parameters; bindings now use `Timestamp`.
- The host JDK/Windows loopback selector failure was avoided by the configured NIO2 connector for both application and loopback-only management servers.
- Phase 03 response builders emitted invalid unquoted ETags; quoted ETags now support the required optimistic-concurrency workflow.

## Commands and actual outcomes

| Command/check                                     | Status | Actual outcome                                                                                                                                                                                                                                 |
| ------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git status --short`; `git branch --show-current` | PASS   | Started clean on `main`; work remained uncommitted. Recommended developer branch: `feature/phase-03-public-editorial` from `develop`.                                                                                                          |
| Official Angular/Spring compatibility review      | PASS   | Pinned GA combinations are supported; no manifest/lockfile change required.                                                                                                                                                                    |
| `pnpm build` and final `pnpm build:public`        | PASS   | Public SSR, staff CSR and all libraries built; 12 static routes prerendered. Host Node 23.5 warned because it is not the pinned Node 24.19.                                                                                                    |
| `pnpm test`                                       | PASS   | Six frontend test targets passed (8 tests total).                                                                                                                                                                                              |
| `pnpm typecheck`                                  | PASS   | Workspace TypeScript completed with no errors.                                                                                                                                                                                                 |
| `pnpm format:check`                               | PASS   | All Prettier-managed files passed.                                                                                                                                                                                                             |
| `pnpm api:check`                                  | PASS   | The OpenAPI client regenerated without committed drift. An earlier concurrent run hit Windows file contention; the required sequential rerun passed.                                                                                           |
| `backend\\mvnw.cmd verify`                        | PASS   | 14 tests passed, including uncleared-media publication refusal; PostgreSQL 17.11 Testcontainers applied and revalidated all four migrations.                                                                                                   |
| Live local OIDC/session/editor lifecycle          | PASS   | Session 201, create 201, publish 204, stale update 412, published GET 200 with script removed, archive 204, archived GET 404, logout 204.                                                                                                      |
| Raw SSR checks without JavaScript                 | PASS   | Listings/details include published copy and SEO; dynamic missing content returns 404; canonical links and noindex are present.                                                                                                                 |
| `pnpm test:e2e:phase03`                           | PASS   | 11 stable-Chrome tests passed: exact required viewports, every supported route at 320px, 200% reflow, accessibility-tree semantics, keyboard menu/FAQ/gallery behavior, focus trapping/return, hydration, dynamic 404 and axe WCAG A/AA scans. |
| Production-mode build/SSR inspection              | PASS   | Production emitted no robots noindex/header or demo banner, omitted Boards from navigation, retained a prominent non-clickable board proposition and rendered dynamic published content.                                                       |

## Acceptance criteria

- **PASS:** Required public route set, primary-offer positioning, synthetic/demonstration labelling, disabled real contact actions and production-safe unavailable routes.
- **PASS:** Published-only public APIs, stable keyset pagination, project ordering, category filtering, complete published-only sitemap and 60-second public cache policy.
- **PASS:** API-backed SSR contains content and SEO without JavaScript; missing/draft/archived details return a genuine HTTP 404.
- **PASS:** Create/publish/stale-update/archive was exercised through a fresh MFA-simulated federated session. Changes were visible immediately, within the five-minute requirement.
- **PASS:** Separate edit/publish authorization, server-side permission checks, 428/412 concurrency behavior, sanitisation and media publication clearance are implemented.
- **PASS:** Production cannot publish referenced DEMO_ONLY, PENDING/PRIVATE, unscanned or uncleared media. No unsigned/public-original shortcut exists.
- **PASS:** Stable Chrome verified all five required viewport widths, 200% reflow, no horizontal overflow, visible focused controls, keyboard menu/FAQ behavior and screen-reader-oriented accessibility-tree names/state.
- **PASS:** Gallery hydration, keyboard opening, native modal containment, Escape, focus return, labelled previous/next controls and image-position announcement passed.
- **PASS:** Axe found no WCAG 2.0/2.1/2.2 A/AA violations in representative home, open mobile navigation, expanded FAQ and open gallery-dialog states.

## Limitations and provider checks pending

- Real Cognito/IdP/MFA federation remains a Phase 02 production-readiness check; this phase used only the explicitly local, MFA-simulated provider.
- Replace demo copy and illustrations only through A07 revisions and cleared `MediaAsset` references. Genuine media ingestion remains Phase 06.
- Automated accessibility checks cover detectable WCAG issues and accessibility-tree semantics; periodic testing with representative assistive-technology users remains an operational quality activity, not a Phase 03 blocker.

## Reusable handoff reference

- **Schema map:** `content_entry` owns type, slug, state, current/published revision, featured/category and publication time; immutable `content_revision` owns title, summary, sanitised body, structured metadata and actor/time; `content_slug_redirect` retains old published slugs; `media_asset` plus `content_media_reference` enforce placement and clearance.
- **Design tokens:** charcoal `#24221f`, off-white `#faf7f1`, timber `#55371f`, focus amber `#b86121` and demo gold `#f4d88e`; component layouts use a 45–46rem reading measure and 72rem shell maximum.
- **Supported routes:** `/`, `/property-transformation`, `/services`, `/services/{slug}`, `/projects`, `/projects/{slug}`, `/cabinetry`, `/about`, `/contact`, `/faqs`, `/privacy`, `/terms`; future direct unavailable states remain at `/boards`, `/workshop/board-cutting`, `/hardware` and `/request-quote`.
- **Publication/cache strategy:** only `published_revision` is public; writes use separate grants and quoted ETags; public responses cache for at most 60 seconds; the renderer retains no private or long-lived response cache, so publication is visible well inside five minutes; hashed assets are immutable.
- **Replacing demo content:** use A07 to create a new revision, retain synthetic labelling until evidence is approved, attach only PUBLIC/CLEAN/CLEARED non-demo media, publish with a current ETag, then verify the public API and SSR route. Never replace repository placeholders with customer originals before Phase 06 ingestion and clearance.

## Next-phase handoff

Phase 03 acceptance is complete. Reuse the nested public content DTOs, route-resolver hydration pattern, `ContentService` permission helpers, quoted ETag workflow, revision/redirect rules, media-clearance gate, typed site mode, CSS tokens, public SSR proxy/cache behavior and generated client. Phase 04 board catalogue content must attach to these publication guards rather than bypass them.

No changes were committed or pushed.
