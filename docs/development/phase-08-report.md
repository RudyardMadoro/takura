# Phase 08 report — Quotation revisions, approval, issue and secure customer viewing

Date: 2026-10-21  
Overall status: **PASS**

## Scope and source traceability

Implemented Phase 08 against Requirements v1.2, Specification v1.1, Architecture v1.0 and the Phase 01–07 reports. The three source documents and their extracted paragraphs/tables were present under `docs/source/`. The implementation maps FR 19–20; SP 07, 15–18, 21–24 and 34–35; AR 08 and 17; T13–16; AAT 06.

The work remains within the Spring Boot modular monolith, Angular public SSR/staff CSR boundary, PostgreSQL/Flyway and the existing durable outbox. It does not generate prices or PDFs, accept quotes online, take payments, reserve stock or start fabrication/construction.

The work remains on `main` and uncommitted. Recommended developer branch: `feature/phase-08-quotation-lifecycle` from `develop`.

## Files changed

- Quotation application and HTTP API: `backend/src/main/java/com/example/takura/quotations/`.
- Quote delivery integration: `CommunicationPort.java` and `OutboxWorker.java`.
- Protected prepared-PDF upload: `UploadService.java` and `UploadController.java`.
- Security and local secret configuration: `SecurityConfiguration.java` and `application-local.yaml`.
- PostgreSQL/Flyway: `V9__quotation_revisions_and_customer_access.sql` and `PostgresqlMigrationTest.java`.
- Staff A06: `quote-admin.page.ts`, staff routes and the enquiry quote link in `board-operations.page.ts`.
- Customer P17: `customer-quote.page.ts`, public routes and the SSR proxy/header rules in `server.ts`.
- Contract/generated client: `contracts/openapi.yaml` and `libs/api-client/src/generated/`.
- Synthetic permissions: `ops/demo-data.sql`.
- Tests/scripts: `QuoteServicePostgresqlTest.java`, `phase-08-customer-quote.spec.ts` and `package.json`.
- This report.

## Architecture decisions and state/approval rules

- A quote group belongs to one enquiry and retains an immutable revision sequence and unique quote number. Monetary values use `BigDecimal` and decimal strings. The labelled local fixture amount is ZAR 2500.00 only.
- Draft metadata includes the exact CLEAN private PDF ID, immutable object version/checksum, amount/currency/tax mode, reviewed scope, terms, commercial basis and checklist evidence. Staff quote uploads accept exactly one PDF through the protected Phase 06 media flow.
- The state machine is `DRAFT → AWAITING_APPROVAL → APPROVED → ISSUED`, with explicit cancellation, revocation, expiry and supersession states. Editing an approval-bound field recalculates the canonical sorted-JSON digest, clears approval and returns the revision to DRAFT.
- Approval binds the PDF checksum and all material metadata/terms. The approver must differ from the drafter and hold `quote:approve`; administrator status alone grants nothing. Issue holds the revision row lock and rechecks the exact approved digest, preventing an edit/approval/issue race.
- Expiry is calculated from the preserved configuration version using the configured 14 calendar days and 17:00 Africa/Johannesburg instant. Historical revisions retain their resolved instant and rule version.
- Issue atomically commits the immutable issued snapshot, hashed customer grant, encrypted delivery secret reference, idempotency result and semantic outbox event. Replaying an issue key does not create another grant or event. A later draft does not supersede an issued quote; only issuing its replacement does so.
- Customer links contain a 256-bit random token in `/quote/view#...`. Only its hash is stored in the grant. The token is AES-256-GCM protected in a separately retained delivery-secret row for the worker, referenced—not embedded—in the ordinary outbox payload, and destroyed after accepted delivery.
- Fragment exchange is rate-limited and returns a short-lived random session whose hash alone is stored. The fragment is removed immediately and neither token nor session enters local/session storage. Every metadata and PDF request rechecks grant, revision, expiry and revocation, so an active session stops working after revocation or supersession.
- The PDF is streamed through the authorised API with bounded bytes, safe filename, `no-store`, noindex and restricted-referrer headers. No long-lived presigned customer link, public object path, SSR cache, service-worker cache or analytics integration exists.
- Email issue creates a durable test-sink event. Provider/test-sink acceptance or controlled phone-only manual evidence records dispatch and advances Phase 07 to QUOTE_SENT exactly once. Issue alone, a queued message, opening or downloading does not change the lead state.
- `ACCEPTED_EXTERNALLY`, `DECLINED` and `NO_RESPONSE` pin the exact revision, actor, time and evidence. Only separately authorised external acceptance can request WON. No customer-facing Accept or Pay action exists.
- Revocation requires an explicit grant and reason, invalidates new exchanges and active sessions, and preserves the issued evidence. Staff guidance states that already downloaded bytes cannot be recalled.

## Migration and configuration

- V9 adds quote groups/revisions, issue-idempotency records, hashed customer grants/sessions, rate-limit attempts, encrypted bounded-retention delivery secrets and offline outcomes, with state/check constraints and workload indexes.
- The existing runtime role receives only the required table/sequence access. Flyway validates and applies nine migrations.
- Local encryption uses an explicitly synthetic development key in the local profile; production must inject a distinct protected 32-byte key and must not reuse the fixture.
- Demo Estimator and Approver remain separate identities. Demo grants separate drafting, approval, issue/revoke and external-commercial-confirmation operations.
- Angular 22.2.1/TypeScript 6.0.2/Node 24.x and Spring Boot 3.5.16/Java 21 remain pinned. The available shell used unsupported Node 23.5 and emitted a warning; builds still passed.

## Commands and actual outcomes

| Command/check                                            | Status | Actual outcome                                                                                                                                                                                                                                             |
| -------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git status --short`; `git branch --show-current`        | PASS   | Existing uncommitted Phase 01–07 work was preserved on `main`; Phase 08 remains uncommitted.                                                                                                                                                               |
| `backend\\mvnw.cmd verify`                               | PASS   | 32 tests passed and 2 opt-in provider tests were skipped; PostgreSQL 17.11 applied and revalidated all nine migrations.                                                                                                                                    |
| `QuoteServicePostgresqlTest` lifecycle/concurrency suite | PASS   | Three real-PostgreSQL tests covered digest approval, self-approval denial, idempotent issue/outbox, worker acceptance, exchange/document/revocation, replacement supersession, edit invalidation, phone-only manual dispatch and externally evidenced WON. |
| `pnpm api:generate`                                      | PASS   | OpenAPI Angular client regenerated after every contract change.                                                                                                                                                                                            |
| `pnpm test`                                              | PASS   | Six frontend targets passed, 8 tests total.                                                                                                                                                                                                                |
| `pnpm build` and final `pnpm build:libs`                 | PASS   | Public SSR, staff CSR and libraries built; the regenerated quote commands compile. Nine public static routes prerendered.                                                                                                                                  |
| `pnpm test:e2e:phase08`                                  | PASS   | Stable Chrome passed both tests: fragment scrubbing, memory-only session, authorised metadata, no Accept/Pay, no persistent browser storage, generic revoked/invalid state, 320px no-overflow and zero axe WCAG A/AA findings.                             |
| `pnpm format:check`                                      | PASS   | All Prettier-managed files passed.                                                                                                                                                                                                                         |
| `docker compose config --quiet`                          | PASS   | Local composition remains valid with the Phase 07 `.env` alignment.                                                                                                                                                                                        |
| `git diff --check`                                       | PASS   | No whitespace errors; Git emitted only the repository's existing Windows line-ending notices.                                                                                                                                                              |

## Acceptance status

- **PASS:** unclean, incomplete, unapproved and digest-changed revisions cannot issue; self-approval is denied and row locks/digest rechecks prevent racing a different snapshot.
- **PASS:** repeated issue creates one issued revision/grant/event. Sink failure leaves the immutable quote and prior enquiry stage intact; acceptance/manual evidence advances QUOTE_SENT once.
- **PASS:** a replacement draft leaves the original valid; issuing the replacement supersedes it and blocks the previous grant/session on the next request.
- **PASS:** access is revision-scoped and revalidated for every metadata/PDF request. Tokens are absent from logs, ordinary outbox payloads, browser persistent storage, SSR caches and analytics.
- **PASS:** phone-only manual dispatch and separately authorised external commercial acceptance are implemented and audited. No online acceptance, payment, cart or automatic quote/PDF generation appears.
- **PASS:** the 320px customer view has no horizontal overflow and axe reports no WCAG A/AA findings; invalid/revoked access uses one generic accessible response.

## Limitations and provider checks pending

- Real email provider callbacks, delivery/bounce semantics and encrypted-secret lifecycle operations beyond the local test sink remain Phase 09 work. The local sink verifies accepted/unknown/failure integration behavior only.
- Real S3/CORS/OAC/IAM evidence remains the documented Phase 06 opt-in provider check. Phase 08 uses the existing private CLEAN-object abstraction and API proxy; no AWS account was provisioned or mutated.
- Browser verification mocks the quote API so secrets remain synthetic. The complete server lifecycle is verified separately against PostgreSQL and the local outbox worker.

## Next-phase handoff

Phase 09 should consume the semantic quote issue event and encrypted delivery-secret reference, report provider acceptance/failure without exposing the token, and call the idempotent dispatch evidence command. Preserve the approval digest, issue idempotency, generic access failures, server-side revocation checks and the distinction between provider acceptance, inbox delivery, reading and commercial acceptance.

No changes were committed or pushed.
