# Phase 04 report — Standalone board catalogue and board-only vertical slice

Date: 2026-10-11  
Overall status: **PASS**

## Scope and source traceability

Implemented Phase 04 against Requirements v1.2, Specification v1.1, Architecture v1.0 and the Phase 01–03 reports. The three source documents and their extracted paragraphs and tables were present under `docs/source/`. Mappings addressed: FR 07, 10–12, 16–18, 21, 28; SP 04, 06, 08, 11–12, 19, 21–23, 24, 30, 35; AR 03, 08, 10, 16; T02, T07–08, T11; AAT 02.

No Phase 05 mixed-service forms, cutting-list editor, uploads, checkout, stock reservation, live stock, payment, automatic quotation, customer account or R2/R3 feature was added.

## Files changed

- Public catalogue and quotation flow: `apps/public-web/src/app/catalogue-api.service.ts`, `catalogue.page.ts`, `quote.page.ts`, route/server configuration, shared navigation and styles.
- Staff A02/A03/A04/A09 slice: `apps/staff-web/src/app/board-operations.page.ts`, routes and workspace navigation.
- Catalogue module: `backend/src/main/java/com/example/takura/catalogue/`.
- Enquiry module: `backend/src/main/java/com/example/takura/enquiries/`.
- Durable delivery and shared web behavior: `OutboxWorker.java`, `WorkerConfiguration.java`, `DomainErrorHandler.java`, security/CORS and correlation filter changes.
- Persistence/configuration: `V5__board_catalogue_and_enquiries.sql`, application configuration, demo grants/teams in `ops/demo-data.sql`, and migration test.
- Contract/client/tests: `contracts/openapi.yaml`, regenerated `libs/api-client/src/generated/`, `tests/e2e/phase-04-board-journey.spec.ts` and the workspace script.
- This report.

## Architecture decisions and source mappings

- `BoardProduct`, `BoardVariant`, immutable `BoardVariantRevision` and `HardwareItem` keep public data separate from internal codes. Public DTOs contain no cost, price, supplier or stock balance. MDF/plywood fixtures use `RAW`; all three SP 30 board fixtures say sourced on request.
- Public `/api/v1/catalogue` reads require enabled, unarchived, published variants. URL filters cover material, finish, thickness and sheet size; paging is keyset-based and capped at 12. `/boards`, `/boards/{slug}` and `/hardware` are SSR/hydrated and retain filter query parameters on return.
- Demo catalogue records use `DEMO-*` internal codes. `application-production.yaml` forces `demo-fixtures-enabled: false`; both public catalogue selection and enquiry validation exclude them in production. Hardware demo slugs are excluded by the same production switch.
- A09 server operations require `catalogue:write`; mutations require `If-Match` (428 missing, 412 stale), append a new specification revision and archive rather than delete. Staff UI exposes catalogue review/archive without price or stock fields.
- The board-only wizard has four explicit steps and keeps its draft only in component memory. It supports 1–10 full-sheet lines, a published variant or free-text specification, quantity 1–9999, SHEET/FULL_SHEET, collection preference and substitutes. Unsupported attachment IDs are rejected honestly.
- `POST /api/v1/enquiries` uses nested `contact` and `location`, current notice acknowledgement, separate marketing consent and stable field paths. EMAIL requires email; CALL/WHATSAPP requires phone. No exact address is collected.
- The enquiry, immutable variant snapshot, owner/routing result, notice version, idempotency result and semantic notification events commit in one transaction. A PostgreSQL transaction advisory lock serialises competing first submissions. Replay lookup occurs before quota, notice and catalogue validation; same key/body returns the original receipt, while a changed body returns `IDEMPOTENCY_CONFLICT`.
- Boards routing selects only an active Boards Team `SALES_COORDINATOR`; otherwise owner remains null and the request is visible in the scoped unassigned queue. List, count and detail share server-side team/record scope. There is no public reference lookup.
- The outbox claims bounded batches with `FOR UPDATE SKIP LOCKED`, records a two-minute lease and commits the claim before invoking the adapter. Expired leases are reclaimable. Retries use 1/5/15/60/240-minute delays and end in `FAILED_REQUIRES_REVIEW`. Payloads contain only template, synthetic sink address, safe reference context and trace context—not enquiry text.
- Email enquiries create one acknowledgement event plus a safe staff alert. Phone-only enquiries create only the staff alert and rely on the on-screen committed receipt.
- Submission quotas store only a SHA-256 risk-bucket hash. Five new enquiries per ten minutes is the configurable demo behavior; idempotent replay does not consume quota.

## Migration and configuration

- Flyway V5 adds catalogue/revision/index tables, enquiries and request-line snapshots, scoped record grants, idempotency records, friendly-reference sequence, abuse buckets and notification outbox/lease indexes.
- Three visibly synthetic board variants and one synthetic supporting supply are repeatable fixtures. No price, stock count, capacity, credential, customer address, testimonial or live contact value was introduced.
- Demo Owner receives `catalogue:write` and `enquiry:all:read`; Demo Coordinator belongs to `BOARDS` and retains assigned-enquiry access. Content Editor receives no lead access.
- Privacy notice target is `demo-privacy-v1`. Public cache remains 60 seconds; production demo-fixture exposure is explicitly disabled.

## Commands and actual outcomes

| Command/check                                            | Status  | Actual outcome                                                                                                                                                                        |
| -------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git status --short`; `git branch --show-current`        | PASS    | Started clean on `main` at the completed Phase 03 commit. Phase 04 remains uncommitted. Recommended developer branch: `feature/phase-04-board-catalogue` from `develop`.              |
| Source documents/reports and pinned compatibility review | PASS    | All sources present and reviewed. Existing Angular 22.2.1/TypeScript 6.0.2/Node 24.19 and Spring Boot 3.5.16/Java 21 pins remain compatible; no version change was required.          |
| `pnpm build` and final `pnpm build:public`               | PASS    | Public SSR, staff CSR and libraries built. Host Node 23.5 warned because it is not the pinned Node 24.19.                                                                             |
| `pnpm test`                                              | PASS    | Six frontend targets passed (8 tests total).                                                                                                                                          |
| `pnpm api:generate`                                      | PASS    | OpenAPI validated and the Angular client regenerated with Phase 04 models/operations.                                                                                                 |
| `pnpm format:check`                                      | PASS    | All Prettier-managed files passed after formatting.                                                                                                                                   |
| `backend\\mvnw.cmd verify`                               | PASS    | 14 tests passed; PostgreSQL 17.11 Testcontainers applied and revalidated all five migrations.                                                                                         |
| `pnpm test:e2e:phase04`                                  | PASS    | Stable Chrome completed published board → two sheets → committed reference; mobile catalogue/wizard/hardware had no axe WCAG A/AA findings or horizontal overflow.                    |
| Live idempotency/concurrency checks                      | PASS    | Same key/body replayed one reference; two simultaneous calls returned the same reference; changed body returned `IDEMPOTENCY_CONFLICT`.                                               |
| Live phone-only/snapshot checks                          | PASS    | Phone-only returned a receipt and had zero `ENQUIRY_RECEIVED` events. Email request had one acknowledgement; persisted snapshot retained `DEMO-B01`/revision specification.           |
| Live outbox recovery check (`local,worker`)              | PASS    | A deliberately expired `LEASED` event was reclaimed; all 13 pending/recovered demo events became `DELIVERED`, with zero remaining leases. Provider calls occurred after claim commit. |
| Real SES/provider delivery                               | NOT RUN | Deliberately deferred to Phase 09; only the explicit `example.invalid` local sink was exercised.                                                                                      |

## Acceptance criteria

- **PASS:** Anonymous visitor browses a published board, requests two full sheets without account/files/construction, receives one committed reference and creates one acknowledgement event plus the scoped Boards request.
- **PASS:** Phone-only request receives an on-screen receipt and creates no missing-email/acknowledgement task.
- **PASS:** Concurrent same-key/same-body produces one enquiry/reference; changed body returns 409; replay occurs before current catalogue/privacy checks.
- **PASS:** Variant specifications are immutable JSON snapshots. Disabled/unpublished/demo-in-production variants return `VARIANT_UNAVAILABLE` with a recoverable field path and no substitution.
- **PASS:** Active Boards coordinator routing and null-owner unassigned fallback are implemented. Content Editor and out-of-scope Reviewer have no enumeration/detail authority; list/count/detail share the same scope predicate.
- **PASS:** Expired worker lease recovery was exercised. Claim locks are committed before the sink call, and delivery failure updates only the outbox—never the enquiry transaction.
- **PASS:** No public price, stock count, cart, basket, checkout, reservation or payment exists.

## Limitations and provider checks pending

- Real email/SES behavior and provider reconciliation remain Phase 09 readiness checks; the tested adapter accepts only synthetic `example.invalid` recipients.
- Catalogue media uses no temporary public-original or upload shortcut. Genuine ingestion/scan/derivatives remain Phase 06.
- The host used Node 23.5 for frontend commands; CI/developer verification should use pinned Node 24.19 to remove the host warning.

## Next-phase handoff

Phase 05 should extend, not flatten, `CreateBoardEnquiry`: preserve nested contact/location, existing request-line snapshots, advisory-lock idempotency ordering and one-reference/one-acknowledgement semantics. Reuse the Boards routing/team scope, `DomainErrorHandler`, focusable error summary, memory-only draft, outbox claim lifecycle and `phase-04-board-journey.spec.ts` as a mandatory regression. Add later services to routing precedence without duplicating board-cutting details.

No changes were committed or pushed.
