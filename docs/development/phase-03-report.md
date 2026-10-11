# Phase 03 report — Responsive public website and editorial content

Date: 2026-10-11  
Overall status: **BLOCKED** (implementation and automated verification pass; required 200% zoom, screen-reader and automated accessibility evidence remains not run)

## Scope and source traceability

Implemented Phase 03 against Requirements v1.2, Specification v1.1, Architecture v1.0 and the Phase 01–02 reports. All three source documents were present under `docs/source/`; their extracted paragraphs and tables were reviewed. Mappings addressed: FR 01–06, 08–09, 21–22, 25–26; SP 02–05, 19–20, 26–27, 30, 32; AR 01, 16–17; T01, T18, T20, T23; AAT 01, 12.

The work stays within Angular public SSR/staff CSR, the Spring Boot modular monolith and PostgreSQL/Flyway. No Phase 04 catalogue, checkout, inventory, customer accounts or R2/R3 functionality was added.

## Files changed

- Public SSR application: `apps/public-web/src/app/app.config.ts`, `app.config.server.ts`, `app.routes.server.ts`, `content-api.service.ts`, `public.page.ts`, `server.ts` and `styles.scss`.
- Staff A07 editor: `apps/staff-web/src/app/app.routes.ts`, `staff.pages.ts` and `content-editor.page.ts`.
- Editorial API/domain: `backend/src/main/java/com/example/takura/content/`.
- Security/runtime prerequisite repairs: `StaffSessionService.java`, `LocalOidcProvider.java`, `SecurityConfiguration.java`, `WebConfiguration.java`, `ManagementConnectorConfiguration.java` and the management-context imports resource.
- Database/tests: `V4__content_media_clearance.sql`, `ContentServiceTest.java`, `PostgresqlMigrationTest.java`, `application.yaml`, `pom.xml` and `ops/demo-data.sql`.
- Contract/generated client: `contracts/openapi.yaml` and `libs/api-client/src/generated/`.
- This report.

## Architecture decisions and handoff map

- Public pages P01–P07, P12–P14 and P18–P19 use shared header/footer, mobile disclosure navigation, service cards, process/proof sections, unavailable states and purposeful Phase-boundary CTAs. Board supply remains a primary offer; its catalogue is explicitly deferred.
- Public service/project lists and details are backed by published revisions only. Lists default/max to 12, use a featured/publication-time/ID keyset cursor, and projects accept an allowlisted category filter. The sitemap traverses every page of published entries.
- Angular server rendering fetches public APIs only. The Node SSR host exposes a narrowly allowlisted same-origin public API proxy, applies 60-second public caching, immutable hashed assets, global demo noindex headers and genuine 404/308 behavior for dynamic content. No private token or staff context enters SSR.
- A07 supports create, revise, publish and archive. `content:write` and `content:publish` are separate server-side checks. `If-Match` is mandatory (428 when absent, 412 when stale); ETags are quoted correctly.
- Entries retain immutable revisions and DRAFT/PUBLISHED/ARCHIVED state. Slugs are 3–100 characters, unique by type, checked against reserved paths, and old published slugs become loop-protected redirects.
- Rich HTML is stored only after OWASP allowlist sanitisation. API JSON uses external snake_case and the versioned OpenAPI client was regenerated.
- `MediaAsset` references are established without upload shortcuts. Publication rejects referenced media unless it is PUBLIC, CLEAN, CLEARED and not DEMO_ONLY. Upload, scanning and derivatives remain Phase 06 work.
- Three repository-owned, visibly synthetic owner-development concepts are seeded without addresses, tenant data, testimonials, accreditation or claims of client/completed work.
- Palette tokens remain replaceable charcoal/off-white/timber. Galleries reserve space and provide captions, alt text, reduced motion, keyboard activation, a modal dialog, Escape close, focus return, labelled navigation and a live position announcement.

## Migrations and configuration

- `V4__content_media_clearance.sql` adds constrained media references, publication-clearance attributes and indexes; Flyway now validates and applies four migrations.
- Demo Owner receives both editorial operations; ordinary Content Editor remains write-only. No provider groups become administrators.
- Global Jackson snake_case is enabled. Public cache defaults to 60 seconds. Preview/demo responses are noindex and real contact actions remain disabled.
- Angular 22.2.1/TypeScript 6.0.2/Node 24.19 and Spring Boot 3.5.16/Java 21 remain pinned. Official compatibility was checked at kickoff; no version change was required.
- No credentials, paid infrastructure, external account, production deployment, live data or real message was created or changed.

## Prerequisite defects repaired

- The Phase 02 local OIDC controller lacked controller registration and was then visible outside its guarded local profile. It is now registered only when both the `local` profile and explicit local-provider flag are active.
- PostgreSQL could not infer JDBC types for raw `Instant` session/content parameters; bindings now use `Timestamp`.
- The host JDK/Windows loopback selector failure was avoided by the configured NIO2 connector for both application and loopback-only management servers.
- Phase 03 response builders emitted invalid unquoted ETags; quoted ETags now support the required optimistic-concurrency workflow.

## Commands and actual outcomes

| Command/check                                                     | Status         | Actual outcome                                                                                                                                                                                                                                                                     |
| ----------------------------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git status --short`; `git branch --show-current`                 | PASS           | Started clean on `main`; work remained uncommitted. Recommended developer branch: `feature/phase-03-public-editorial` from `develop`.                                                                                                                                              |
| Official Angular/Spring compatibility review                      | PASS           | Pinned GA combinations are supported; no manifest/lockfile change required.                                                                                                                                                                                                        |
| `pnpm build` and final `pnpm build:public`                        | PASS           | Public SSR, staff CSR and all libraries built; 12 static routes prerendered. Host Node 23.5 warned because it is not the pinned Node 24.19.                                                                                                                                        |
| `pnpm test`                                                       | PASS           | Six frontend test targets passed (8 tests total).                                                                                                                                                                                                                                  |
| `pnpm format:check`                                               | PASS           | All Prettier-managed files passed.                                                                                                                                                                                                                                                 |
| `pnpm api:generate`                                               | PASS           | Contract regenerated deterministically; generated changes intentionally differ from HEAD because this phase is uncommitted.                                                                                                                                                        |
| `backend\\mvnw.cmd verify`                                        | PASS           | 13 tests passed; PostgreSQL 17.11 Testcontainers applied and revalidated all four migrations.                                                                                                                                                                                      |
| Live local OIDC/session/editor lifecycle                          | PASS           | Session 201, create 201, publish 204, stale update 412, published GET 200 with script removed, archive 204, archived GET 404, logout 204.                                                                                                                                          |
| Raw SSR checks without JavaScript                                 | PASS           | Listings/details include published copy and SEO; dynamic missing content returns 404; canonical links and noindex are present.                                                                                                                                                     |
| Responsive browser checks                                         | PASS (partial) | 320, 375, 768, 1024 and 1440 viewport attempts reported no horizontal overflow (the in-app browser clamped one 768 attempt to 375). Mobile-menu and FAQ disclosures opened from Enter.                                                                                             |
| Gallery browser interaction                                       | NOT RUN        | The available in-app browser did not complete Angular HTTP hydration for the dynamic project route, despite SSR and the same-origin public API both returning 200. Gallery semantics/build are present, but modal focus/Escape evidence was not completed in a production browser. |
| 200% zoom, screen-reader pass and automated accessibility scanner | NOT RUN        | No supported screen reader or automated accessibility runner was available in this environment.                                                                                                                                                                                    |

## Acceptance criteria

- **PASS:** Required public route set, primary-offer positioning, synthetic/demonstration labelling, disabled real contact actions and production-safe unavailable routes.
- **PASS:** Published-only public APIs, stable keyset pagination, project ordering, category filtering, complete published-only sitemap and 60-second public cache policy.
- **PASS:** API-backed SSR contains content and SEO without JavaScript; missing/draft/archived details return a genuine HTTP 404.
- **PASS:** Create/publish/stale-update/archive was exercised through a fresh MFA-simulated federated session. Changes were visible immediately, within the five-minute requirement.
- **PASS:** Separate edit/publish authorization, server-side permission checks, 428/412 concurrency behavior, sanitisation and media publication clearance are implemented.
- **PASS:** Production cannot publish referenced DEMO_ONLY, PENDING/PRIVATE, unscanned or uncleared media. No unsigned/public-original shortcut exists.
- **PASS (partial):** Responsive overflow checks and keyboard activation for menu/FAQ passed; CSS includes focus, reduced-motion and non-covering layout safeguards.
- **NOT RUN:** Complete gallery focus-trap/return-focus evidence, 200% zoom, screen-reader checks and an automated accessibility scan. These keep overall status **BLOCKED** under the prompt's completion rule.

## Limitations and provider checks pending

- Run the public app in a normal supported browser with the pinned Node runtime and capture the remaining accessibility matrix: 200% zoom, mobile menu, FAQs, gallery focus trap/Escape/return focus, image-position announcement and an automated scanner with findings fixed.
- Real Cognito/IdP/MFA federation remains a Phase 02 production-readiness check; this phase used only the explicitly local, MFA-simulated provider.
- Replace demo copy and illustrations only through A07 revisions and cleared `MediaAsset` references. Genuine media ingestion remains Phase 06.

## Next-phase handoff

Do not start Phase 04 until the remaining accessibility evidence is completed and this report can move from BLOCKED to PASS. Reuse the nested public content DTOs, `ContentService` permission helpers, quoted ETag workflow, revision/redirect rules, media-clearance gate, CSS tokens, public SSR proxy/cache behavior and generated client. Board catalogue content must attach to these publication guards rather than bypass them.

No changes were committed or pushed.
