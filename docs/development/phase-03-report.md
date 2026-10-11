# Phase 03 report — Responsive public website and editorial content

Date: 2026-10-11  
Overall status: **BLOCKED**

## Scope and source traceability

Implemented an initial Phase 03 foundation against Requirements v1.2, Specification v1.1, Architecture v1.0, and the Phase 01–02 reports. The source documents were read from `docs/source/`, including their extracted paragraph and table content. No source document was missing.

Mappings addressed: FR 01–06, 08–09, 21–22, 25–26; SP 02–05, 19–20, 26–27, 30, 32; AR 01, 16–17; T01, T18, T20, T23; AAT 01, 12. The implementation keeps the Angular public SSR / staff CSR and Spring Boot modular-monolith boundaries. No Phase 04 catalogue, checkout, inventory, customer-account, or other R2/R3 functionality was added.

## Files changed

- Public application routes, shell, page component, responsive styles and tests under `apps/public-web/src/app/` and `apps/public-web/src/styles.scss`.
- Editorial application service and HTTP controller under `backend/src/main/java/com/example/takura/content/`.
- Public GET security rules in `backend/src/main/java/com/example/takura/shared/web/SecurityConfiguration.java`.
- Flyway migration `backend/src/main/resources/db/migration/V3__editorial_content.sql` and migration-count test.
- Synthetic editorial seed data and grants in `ops/demo-data.sql`.
- This report.

Repository-wide Prettier also normalised whitespace in the already-modified Phase 02 report and generated `location.ts`; it did not alter their behaviour. Those files were already part of the developer's dirty worktree and were not discarded.

## Architecture decisions

- Added revisioned `content_entry` and immutable `content_revision` records with DRAFT, PUBLISHED and ARCHIVED states.
- Added slug redirect history and checks for unique/reserved slugs and redirect loops.
- Added media metadata and clearance classifications without implementing Phase 06 upload, scanning or derivative creation.
- Separated `content:write` and `content:publish` checks through the Phase 02 permission service; updates require `If-Match` and return 428/412 through the existing error handling.
- Public service/project queries expose published records only, default to 12 rows, and use featured/publication-date/id ordering. Project category and cursor inputs are allowlisted/validated.
- Rich text is sanitised with a conservative server-side allowlist before persistence.
- Added shared responsive header/footer, mobile navigation, unavailable states, synthetic project/service presentation, FAQs, legal/contact placeholders and demo noindex behaviour.
- Board supply is prominent while the catalogue remains explicitly unavailable until Phase 04.

## Migration and configuration

- `V3__editorial_content.sql` creates editorial entries, revisions, slug redirects and media metadata/references.
- Three visibly synthetic owner-development concepts and three synthetic service records are seeded. They are labelled as concepts, not client commissions or completed work.
- No credentials, provider accounts, paid infrastructure, production deployment, real messages or live data were created or changed.

## Commands and actual outcomes

| Command/check                                                    | Status         | Outcome                                                                                                                                                              |
| ---------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git status --short`; `git branch --show-current`                | PASS           | Worktree was already dirty; current branch is `main`. Existing work was preserved. Recommended developer branch: `feature/phase-03-public-editorial` from `develop`. |
| `pnpm build:public`                                              | PASS           | Angular SSR build completed and prerendered 14 static routes.                                                                                                        |
| `pnpm build`                                                     | PASS           | Public app, staff app and libraries built. Local Node 23.5 emitted the repository's version warning against pinned Node 24.19.                                       |
| `pnpm test`                                                      | PASS           | 6 test files and 8 tests passed after updating the public shell expectation.                                                                                         |
| `backend\\mvnw.cmd verify`                                       | PASS           | 11 tests passed; Flyway replayed three migrations.                                                                                                                   |
| `pnpm format:check`                                              | PASS           | All Prettier-managed files pass.                                                                                                                                     |
| `pnpm api:check`                                                 | FAIL           | Generation succeeds, but the check detects existing formatting drift in generated `location.ts`. Phase 03 endpoints are not yet represented in OpenAPI.              |
| `ops/seed-demo.ps1 -Environment local` (second run)              | PASS           | All inserts reported `INSERT 0 0`, confirming idempotency.                                                                                                           |
| Inspect prerendered HTML without JavaScript                      | PASS (partial) | Static HTML contains public copy, unique titles/descriptions and global demo noindex. Canonical is incorrectly emitted as `<meta rel="canonical">`, not a `<link>`.  |
| Start backend and exercise live API                              | BLOCKED        | PostgreSQL migrated V2→V3, but the application hit the previously recorded Windows/JDK loopback selector `SocketException: Invalid argument: connect`.               |
| Automated accessibility and manual viewport/screen-reader matrix | NOT RUN        | No browser accessibility runner or complete 320/375/768/1024/1440, 200% zoom and screen-reader evidence was completed.                                               |

## Acceptance criteria

- **PASS (partial):** Responsive public route set, synthetic offer positioning, demo/staging noindex, disabled contact actions, keyboard-visible focus, reduced-motion styles, FAQ semantics and SSR static content are present.
- **PASS:** Persistence supports immutable revisions, lifecycle states, slug constraints/history, optimistic concurrency and separately authorised editing/publishing.
- **PASS:** Synthetic projects avoid exact addresses, tenant data, testimonials, accreditation and unverified client-work claims.
- **BLOCKED:** The Angular pages currently render repository fixtures rather than fetching published public API revisions during SSR. End-to-end draft exclusion and publication freshness therefore are not demonstrated.
- **BLOCKED:** A07 staff editor screens are not implemented; only the secured backend update surface exists.
- **BLOCKED:** API and renderer cache invalidation on publication is not implemented or verified within five minutes.
- **BLOCKED:** Dynamic missing/draft service and project routes do not yet prove a genuine HTTP 404 status.
- **BLOCKED:** Canonical link output is invalid and structured metadata is incomplete.
- **BLOCKED:** The OpenAPI contract and generated TypeScript client do not include the Phase 03 editorial APIs.
- **BLOCKED:** Media metadata exists, but publication does not yet enforce all DEMO_ONLY/PENDING/PRIVATE/unscanned and claim-verification clearance rules through references.
- **NOT RUN:** Publish/edit/archive through the staff UI, renderer/API freshness, complete keyboard/screen-reader gallery checks, automated accessibility scan and the required responsive/zoom matrix.

## Limitations and provider checks pending

The phase is not complete. The Phase 02 local provider and live backend remain unverified because of the host runtime issue above. No real Cognito/IdP/MFA or production provider check was attempted. The public UI needs API-backed SSR, a complete editor, cache invalidation, canonical/structured metadata correction, dynamic 404 handling, media publication enforcement, OpenAPI generation and full accessibility/manual-browser verification.

## Next-phase handoff

Do not begin Phase 04 yet. First close the Phase 03 blockers, rerun all checks, and exercise publishing against a working local backend. Reusable foundations are the `content_entry`/`content_revision` schema, `ContentService` permission and concurrency checks, charcoal/off-white/timber CSS tokens, the public route inventory, and visibly synthetic seed data. Genuine media ingestion remains deferred to Phase 06 without adding an unsigned or public-original shortcut.

No changes were committed or pushed.
