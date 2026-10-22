# R1 release traceability

Date: 2026-10-22. Evidence statuses describe this checkout, not production-provider readiness.

## Functional and non-functional requirements

| IDs       | Status   | Implementation and evidence                                                                                                             |
| --------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| FR 01–09  | PASS     | Public P01–P14/P18–P19, editorial revisions, catalogue positioning and Phase 03/04 browser/API tests.                                   |
| FR 10–18  | PASS     | Nested conditional enquiry, idempotency, routing, uploads, inbox/tasks/assessments and Phase 04–07 PostgreSQL/browser tests.            |
| FR 19–20  | PASS     | Immutable quote revisions, independent approval, issue/revocation and secure view; Phase 08 tests.                                      |
| FR 21–25  | PASS     | Publication/media clearance, federated scoped staff security and shared responsive API client; Phase 02/03/06 tests.                    |
| FR 26     | PASS     | Pinned Angular SSR/staff CSR, Spring modular monolith, Flyway/PostgreSQL monorepo and architecture tests.                               |
| FR 27     | BLOCKED  | Local zero-grant/session/MFA simulation passes; real Cognito federation and MFA path require an owned IdP.                              |
| FR 28     | BLOCKED  | Outbox, sink, SES/Twilio ports and callback rejection pass; real SES/domain and provider acceptance remain external.                    |
| FR 29     | DEFERRED | R3 payment port and hostile callback fixtures only; flags false and no checkout/payment ledger/routes.                                  |
| NFR 01–03 | BLOCKED  | Security/privacy controls pass locally; final POPIA/legal wording, operator agreements and production IdP/provider checks are external. |
| NFR 04    | PASS     | Automated axe plus documented keyboard/screen-reader/zoom matrices in Phase 03–08 evidence.                                             |
| NFR 05    | BLOCKED  | Bundle budgets exist; adequate field CWV and current representative mobile lab evidence require deployed traffic/lab run.               |
| NFR 06    | PASS     | SSR HTML, SEO, canonical/sitemap, redirect and genuine 404 tests pass.                                                                  |
| NFR 07    | BLOCKED  | Alerts/synthetic design exists; real off-host uptime, receiver evidence and 99.5% provider support require launch environment.          |
| NFR 08    | BLOCKED  | Encrypted backup/restore tooling and validation inventory supplied; measured isolated restore rehearsal is not run here.                |
| NFR 09    | PASS     | Redacted structured logs, metrics, tracing, private management network, dashboards and alert rule tests.                                |
| NFR 10    | PASS     | Immutable Contabo images/Compose and S3 boundaries supplied; no production deployment claimed.                                          |
| NFR 11    | BLOCKED  | CI, manifest and rollback controls supplied; GitHub plan/protected environments and host rehearsal need owner verification.             |

## Specification rules

| IDs      | Status  | Evidence                                                                                                                       |
| -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------ |
| SP 01–05 | PASS    | Versioned settings, immutable service codes, accessible navigation, stable filters and gallery semantics (Phases 02–03).       |
| SP 06–09 | PASS    | Four-step conditional wizard, cabinetry exclusions, board lines and inert cut-list convention (Phases 04–05).                  |
| SP 10    | PASS    | File state machine, pinned immutable bytes and bounded scan checks (Phase 06).                                                 |
| SP 11–14 | PASS    | Transactional idempotency, routing, guarded state table and collision-safe assessments (Phases 04–07).                         |
| SP 15–18 | PASS    | Quote snapshots/dispatch/access plus central permission evaluation (Phases 02, 07–08).                                         |
| SP 19–22 | PASS    | Editorial/media revisions, API conventions, ETags and stable errors (Phases 03/06).                                            |
| SP 23–25 | BLOCKED | Durable communications and privacy controls pass; final legal policy/provider activation is external.                          |
| SP 26–27 | PASS    | Crawlability, noindex boundaries and WCAG regression evidence.                                                                 |
| SP 28    | BLOCKED | Performance budgets configured; field percentiles and representative mobile lab run remain unavailable.                        |
| SP 29    | BLOCKED | Monitoring/recovery targets documented; actual off-host restore timestamps and receiver delivery absent.                       |
| SP 30    | PASS    | Synthetic fixtures are labelled, deterministic and contain no real customer facts.                                             |
| SP 31–36 | PASS    | Pinned modular architecture, SSR/cache boundaries, OIDC/session guards, immutable upload, transactional workers and telemetry. |
| SP 37    | BLOCKED | Contabo Compose/backups supplied; real host/TLS/off-host restore rehearsal not executed.                                       |
| SP 38    | BLOCKED | CI/manifests/migration procedure supplied; protected-environment and compatible-host rollback rehearsal pending.               |

## Public routes and staff screens

| Surface                                                                 | Status  | Evidence                                                                    |
| ----------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------- |
| P01 Home, P02 Property transformation, P03 Services, P04 Service detail | PASS    | SSR route/SEO/404 and responsive Phase 03 tests.                            |
| P05 Project index, P06 Project detail, P07 Cabinetry                    | PASS    | Published-only content, accessible gallery and CTA tests.                   |
| P08 Boards, P09 Board detail, P10 Cutting, P11 Hardware                 | PASS    | Catalogue/filter and board/cutting journeys in Phases 04–06.                |
| P12 About, P13 Contact, P14 FAQs                                        | PASS    | Synthetic-safe contact and accessible disclosures.                          |
| P15 Quote request, P16 Submission result                                | PASS    | Board, phone-only, mixed, error/retry and upload journeys.                  |
| P17 Quote view                                                          | PASS    | Fragment exchange, no-store CSR, revocation and proxied PDF tests.          |
| P18 Privacy/terms, P19 Not found                                        | BLOCKED | Routes/404 pass; live legal text remains pending business/legal approval.   |
| A01 Sign in, A10 Access, A11 Settings                                   | BLOCKED | Local provider/access/config tests pass; live IdP/MFA verification pending. |
| A02 Dashboard, A03 List, A04 Detail, A05 Assessment                     | PASS    | Scoped counts/list/detail, ETag, task/state and assessment race tests.      |
| A06 Quote revision                                                      | PASS    | Draft/review/approval/issue lifecycle and concurrency tests.                |
| A07 Content, A08 Media, A09 Catalogue                                   | PASS    | Permission-split revision editors and clearance/catalogue guards.           |
| A12 Audit/notifications                                                 | PASS    | Restricted redacted events, attempts and bounded retry controls.            |

## Test scenarios

| IDs     | Status | Evidence                                                                                            |
| ------- | ------ | --------------------------------------------------------------------------------------------------- |
| T01–T08 | PASS   | Responsive public, board/cutting/cabinetry/mixed/phone/error/idempotency browser and service tests. |
| T09–T10 | PASS   | Signature/macro/size/pending/late-rejection and immutable-overwrite upload tests.                   |
| T11–T12 | PASS   | Unassigned queue and deterministic Monday/Sunday/holiday business-clock tests.                      |
| T13–T15 | PASS   | Approval mutation, replacement/expiry/revocation and delivery ambiguity tests.                      |
| T16–T17 | PASS   | Copied-ID denial and 412 concurrent staff update tests.                                             |
| T18–T20 | PASS   | Editorial accessibility, clearance/publication and SSR freshness tests.                             |
| T21–T23 | PASS   | Safe operations/provider/privacy/telemetry tests recorded in Phase 07–09 reports.                   |

## Architecture acceptance tests

| ID     | Status   | Evidence or exact next action                                                                                                                                                 |
| ------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AAT 01 | PASS     | SSR content/404/publication test evidence.                                                                                                                                    |
| AAT 02 | PASS     | Concurrent idempotent board submission/outbox test.                                                                                                                           |
| AAT 03 | BLOCKED  | Claim rejection passes locally; run isolated real Cognito access-token matrix.                                                                                                |
| AAT 04 | PASS     | Injected-clock session expiry/revocation tests.                                                                                                                               |
| AAT 05 | PASS     | Pinned-version overwrite and quarantine tests.                                                                                                                                |
| AAT 06 | PASS     | Revoked active quote session/download test.                                                                                                                                   |
| AAT 07 | PASS     | Safe request-to-worker context and log inspection.                                                                                                                            |
| AAT 08 | PASS     | Local 20-VU uncached metadata run: 9,190 requests, p95 16.03 ms, 0.02% failure; representative write/scan/export evidence remains a launch check.                             |
| AAT 09 | BLOCKED  | Build registry digests, then execute staging failure/rollback transcript with manifest.                                                                                       |
| AAT 10 | PASS     | Age-encrypted local restore hash matched; database/reference/constraint evidence matched with 18.1 s RPO and 8.45 s RTO. Real off-host object restore remains a launch check. |
| AAT 11 | DEFERRED | Isolated R3 hostile payment fixtures pass; no payment activation.                                                                                                             |
| AAT 12 | PASS     | Shared DTO/client builds and viewport/keyboard regression evidence.                                                                                                           |

No source Must requirement is silently removed. `BLOCKED` entries name external evidence or business
approval still required; they are not represented as complete. R2 sliders/resources/automatic pricing,
and R3 checkout/payments/native app remain explicitly deferred.
