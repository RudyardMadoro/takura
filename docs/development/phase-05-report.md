# Phase 05 report — Property, cabinetry, workshop and mixed-service enquiries

Date: 2026-10-18  
Overall status: **PASS**

## Scope and source traceability

Implemented Phase 05 against Requirements v1.2, Specification v1.1, Architecture v1.0 and the Phase 01–04 reports. The three baseline Word documents and their extracted paragraph/table content were present under `docs/source/` and reviewed. Mappings addressed: FR 01–03, 06–07, 10–14, 25; SP 02, 06–09, 11–12, 21–22; T03–08, T12, T19–20; AAT 02, 12.

The implementation remains inside the Angular public SSR/staff CSR, Spring Boot modular monolith and PostgreSQL/Flyway architecture. No checkout, reservation, live inventory, cutting-list editor, automated quote, acceptance, financial calculator, customer account or Phase 06 upload path was added.

The current branch is `main`. The recommended developer branch is `feature/phase-05-mixed-enquiries` from `develop`. No branch, commit, tag, push or pull request was created by Codex.

## Files changed

- Public quotation experience: `apps/public-web/src/app/quote.page.ts`, `enquiry-services.ts`, `public.page.ts` and `styles.scss`.
- Safe Phase 06 handoff asset: `apps/public-web/public/cut-list-template.csv`.
- Enquiry domain and scheduling: `EnquiryService.java` and `BusinessTimeCalculator.java`.
- Persistence/configuration: `V6__mixed_service_enquiries.sql`, `application.yaml` and `ops/demo-data.sql`.
- Contract/generated client: `contracts/openapi.yaml` and the generated enquiry/request-line models under `libs/api-client/src/generated/`.
- Verification: `BusinessTimeCalculatorTest.java`, `PostgresqlMigrationTest.java`, the Phase 04 board regression, the Phase 05 Playwright suite and the Phase 05 package script.
- This report.

## Architecture decisions and source mappings

- The canonical enquiry remains nested. It accepts one to ten distinct immutable service codes and a `service_details` object keyed only by selected codes. Each stored detail has a schema version and immutable JSON snapshot.
- Supported codes are `PROPERTY_TRANSFORMATION`, `CONSTRUCTION`, `RENOVATION`, `EXTENSION`, `MAINTENANCE`, `INTERIORS`, `CABINETRY`, `BOARD_SALES`, `BOARD_CUTTING` and `HARDWARE`. Shared Angular presentation helpers live in `enquiry-services.ts`; the server remains authoritative.
- The public wizard has four steps: service selection, conditional requirements, contact/files, and review/submit. Contextual service, project and board links preselect supported services. State is held only in memory and is removed after committed success; no long-lived personal browser draft was introduced.
- Removing populated property, cabinetry or cutting sections requires confirmation. Cancellation restores the native checkbox and retains the section. Accepted removal clears obsolete section data.
- Property requests record representative status, site scope, intended use and bounded optional facts. `NOT_AUTHORISED` remains a permitted discussion route; geographic uncertainty becomes `area_review_required` rather than a service promise or rejection.
- Cabinetry distinguishes `SUPPLY_ONLY`, `FIX_AND_SUPPLY` and `UNDECIDED`, marks approximate dimensions `UNVERIFIED`, and requires acknowledgement that plumbing, wiring, structural work, appliances and countertops are excluded unless explicitly agreed.
- Board cutting records material source, `NEED_HELP`/attachment mode and `FINISHED_PART_SIZE`. `ATTACHMENT` and all submitted attachment IDs are rejected until Phase 06. The downloadable CSV is inert and documents part ID, material, thickness, finished dimensions, quantity, grain, rotation permission, four separately labelled edges, drilling and remarks; it performs no nesting, kerf or manufacture calculation.
- Hardware preserves positive quantities and explicit `EACH`, `PACK`, `LITRE` or `METRE` units, including optional pack wording without conversion. No inventory or reservation is maintained.
- Routing precedence is configurable as PROPERTY → CABINETRY → BOARDS → GENERAL. A mixed request has one owner, with authorised record grants for active coordinators of the remaining relevant teams. Disabled staff are excluded.
- The existing transactional/idempotent Phase 04 creation path now saves mixed detail snapshots, routing, collaborator grants, response deadline rule/version, budget/currency/date snapshots and notification events in the same transaction. Replays still occur before current catalogue/privacy validation.
- Acknowledgement rendering uses the generic enquiry template. Phone-only enquiries create no customer-email event. Acknowledgements do not satisfy the stored first-human-response deadline.
- The business clock adds nine working hours using configured opening/closing times, timezone, holidays and rule version. UTC instants are stored and rule versions remain attached to records.
- Stable error paths, a focusable error summary and same-key retry behavior preserve entered data on transient responses. The 320px/200% zoom fix constrains fields, long tokens, the mobile menu and wrapping wizard actions.

## Migration and configuration dictionary

- `V6__mixed_service_enquiries.sql` adds `area_review_required`, `first_response_due_at`, `business_clock_rule_version`, `budget_band`, `budget_currency` and `desired_start` to enquiries.
- `enquiry_service_detail` stores `(enquiry_id, service_code, schema_version, detail_snapshot)` with service-code and enquiry indexes.
- Request-line fulfilment now supports `FULL_SHEET` and `CUT_TO_SIZE` while retaining the 1–9999 quantity bound and historical variant snapshots.
- `takura.enquiries.routing-precedence`: ordered owner-team selection; demo value `PROPERTY,CABINETRY,BOARDS,GENERAL`.
- `takura.enquiries.business-clock.timezone`: local business timezone; demo value `Africa/Johannesburg`.
- `opens` / `closes`: demo working interval `08:00`–`17:00` on non-holiday weekdays.
- `holidays`: comma-separated ISO dates; empty demo default, parsed deterministically.
- `rule-version`: persisted ruleset identity; demo value `demo-business-hours-v1`.
- Demo identities provide active coordinators for PROPERTY, CABINETRY, BOARDS and GENERAL. These are visibly synthetic fixtures and do not create external accounts or credentials.

## Commands and actual outcomes

| Command/check                                     | Status | Actual outcome                                                                                                                                                                                                                   |
| ------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git status --short`; `git branch --show-current` | PASS   | Resumed on `main` with Phase 05 changes present. Some newly created files had been staged outside Codex between runs; their index state was preserved.                                                                           |
| `pnpm build`                                      | PASS   | Public SSR, staff CSR and all shared/generated libraries built. The host Node 23.5 warning remains because the shell is not using pinned Node 24.19.                                                                             |
| `pnpm test`                                       | PASS   | All six Angular/Vitest targets passed (8 tests total).                                                                                                                                                                           |
| `pnpm format:check`                               | PASS   | All Prettier-managed files passed.                                                                                                                                                                                               |
| `pnpm api:generate`                               | PASS   | The OpenAPI Angular client regenerated successfully and deterministically for the mixed-service contract.                                                                                                                        |
| `backend\\mvnw.cmd verify`                        | PASS   | 17 tests passed, none skipped. PostgreSQL 17.11 Testcontainers validated and applied all six Flyway migrations twice safely.                                                                                                     |
| Business-clock fixtures                           | PASS   | Monday 10:00 → Tuesday 10:00; Sunday → Monday 17:00; holiday and timezone-boundary fixture deterministic.                                                                                                                        |
| Live service/API matrix                           | PASS   | Full-sheet boards, cut-to-size `NEED_HELP`, supply-only kitchen, fix-and-supply wardrobe, property assessment, phone-only maintenance, hardware packs and mixed property/cabinetry/board requests returned committed references. |
| Live persistence/routing inspection               | PASS   | Mixed request stored three versioned details, one Property owner, two scoped collaborators and one acknowledgement. Property uncertainty set review-required. Phone-only maintenance stored no customer-email event.             |
| `pnpm test:e2e:phase05`                           | PASS   | Six stable-Chrome tests passed: Phase 04 board regression, mixed request, mobile 200% zoom/keyboard/axe, removal confirmation, and transient-error preservation/focus.                                                           |
| `git diff --check`; `git diff --cached --check`   | PASS   | No whitespace errors; only the repository's Windows line-ending notices were emitted.                                                                                                                                            |

## Acceptance criteria

- **PASS:** Standalone full-sheet boards remain a complete independent regression journey.
- **PASS:** Cut-to-size `NEED_HELP`, supply-only kitchen, fix-and-supply wardrobe, property, phone-only maintenance, hardware packs and mixed requests were submitted successfully.
- **PASS:** A mixed request produces one reference and owner, scoped collaborators, all selected detail snapshots and one customer acknowledgement.
- **PASS:** Populated service removal requires confirmation; cancelled removal retains state. Field/transient failure preserves entered data and focuses the error summary. Current privacy-version conflict remains a recoverable server error before persistence.
- **PASS:** The nine-working-hour deadline, Sunday start, holiday and timezone cases are covered with an injected clock.
- **PASS:** Upload-dependent actions are explicitly unavailable. Attachment IDs and attachment input mode are rejected server-side; no fake file success or manufacturing output exists.
- **PASS:** Mobile 320px layout at 200% zoom has no page overflow. Keyboard activation and automated WCAG A/AA/2.2 AA checks pass for the tested wizard/catalogue views.

## Limitations and checks pending

- Secure uploads, malware scanning, attachment ownership and mandatory cutting-file rules remain Phase 06 work. This is an intentional phase boundary, not a hidden fallback.
- The cutting template is qualification guidance only. Staff must verify dimensions, grain, edges, drilling and scope before later quote/manufacturing work.
- Demo contact channels remain disabled and notification delivery remains the local test sink. No real message, external account, paid infrastructure, production deployment or live-data mutation was performed.
- The current shell used Node 23.5 rather than pinned Node 24.19; builds passed, but release/CI verification should use the pinned runtime.

## Next-phase handoff

Phase 06 should attach secure uploaded-file identifiers to the existing `attachment_ids` boundary only after ownership, type/size limits, scan state and publication/privacy rules pass. It should enable cutting `ATTACHMENT` only when the required cleared artifact exists, without changing `NEED_HELP` or weakening server validation.

Reuse the ten service codes, `service_details` schema-version snapshots, routing precedence, record collaborators, business-clock rule/version fields, stable field-error paths and idempotent replay behavior. Keep `tests/e2e/phase-04-board-journey.spec.ts` and the mixed Phase 05 test as mandatory regressions.

No changes were committed or pushed by Codex.
