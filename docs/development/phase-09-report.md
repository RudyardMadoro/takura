# Phase 09 report — Reliable communications, privacy operations and observability

Date: 2026-10-22  
Overall status: **PASS**

## Scope and source traceability

Implemented Phase 09 against Requirements v1.2, Specification v1.1, Architecture v1.0 and the Phase 01–08 reports. All three baseline documents and their extracted paragraphs/tables were present under `docs/source/`. Mappings addressed: FR 24 and 28–29; NFR 01–03 and 08–09; SP 23–25, 29 and 35–36; AR 08–10 and 17; T15, T19 and T22–23; AAT 02 and 07. AAT 11 is present only as an isolated disabled future-payment fixture.

The work remains on `main` and uncommitted. Recommended developer branch: `feature/phase-09-communications-privacy-observability` from `develop`.

## Files changed

- Communications: `CommunicationPort.java`, `DeliveryFailure.java`, `OutboxWorker.java`, `SesEventService.java`, `SnsSignatureVerifier.java`, SES/local/disabled adapters and `ProviderWebhookController.java`.
- Privacy: `privacy/application/PrivacyOperationsService.java`, `privacy/controller/PrivacyOperationsController.java` and module documentation.
- Observability: `RequestTelemetryFilter.java`, `OperationalMetrics.java`, application configuration and the optional `compose.observability.yaml` profile under `infra/observability/`.
- Worker/runtime: `WorkerConfiguration.java`, production/local-safe provider flags and Maven telemetry/SES dependencies.
- Database: `V10__communications_privacy_observability.sql`, migration assertion and synthetic Phase 09 grants.
- Contract/client: `contracts/openapi.yaml` and regenerated Angular API client.
- Tests: outbox reliability, SNS rejection, PostgreSQL privacy workflow and isolated payment-contract fixtures.
- Runbooks: communications readiness, privacy/retention, observability and disabled future payments under `docs/operations/`.
- This report.

## Architecture decisions and provider/event contracts

- Local/test communication always resolves to an `example.invalid` sink regardless of arbitrary form email. Production SES is absent unless the production profile and explicit `SES_ENABLED=true` are both present with an approved non-fixture sender.
- SES messages use bounded plain-text templates. Staff alerts use reference/service/authenticated-link context only. Descriptions, plans and attachment content are never included. Quote tokens remain encrypted at rest and are resolved only in worker memory.
- The outbox retains SKIP LOCKED leases and expired-lease recovery. Transient failures follow 1/5/15/60/240-minute delays. Permanent failures stop. Possibly accepted timeouts become `DELIVERY_UNKNOWN` and are excluded from automatic claims. Manual retry requires actor/reason, clears the ambiguity explicitly and is capped at three.
- Provider references are stored after accepted SES calls. Quote state moves only on accepted dispatch evidence, preserving the Phase 08 distinction between API acceptance, delivery, reading and commercial acceptance.
- SES/SNS callbacks are public only at the provider protocol boundary. Verification requires HTTPS, an allowlisted AWS SNS certificate host/path, no redirects, a bounded certificate/body, valid RSA signature, exact environment topic and unique MessageId. Raw bodies are not logged. Bounce/complaint hashes the destination into suppression state; replay is idempotent.
- Twilio SMS/WhatsApp ports and disabled adapter are supplied without routes or sending. Activation requires separate official sender/template/consent/signature/spend review. Demo contact numbers remain null and no PII is placed in messaging URLs.
- `PaymentGateway` remains disabled. Isolated fixtures prove redirects, forged/replayed events, wrong merchant and wrong amount cannot produce paid status. No checkout route, payment ledger, receipt, credential or charge exists.

## Privacy and retention decisions

- Access, correction and deletion requests record a narrow enquiry, request type, identity-evidence reference, scope, actor, approval, action and outcome. Request creation and approval use separate grants/actors and optimistic revision checks.
- Access export contains only the approved enquiry, is no-store, fully CSV-quoted and neutralises formula-leading cells. General export permission does not grant privacy export.
- Legal holds are checked before deletion. Approved deletion revokes quote grants/sessions, stops pending communication, marks attachments for deletion, clears marketing state, scrubs customer fields and leaves a hashed versioned tombstone plus audit.
- Restore replay reapplies authorised deletion tombstones before restored personal data can be exposed. Retention failures remain retryable. The 12-month closed-unsuccessful threshold produces review eligibility only; won-contract automatic deletion remains disabled pending approved policy.
- Marketing withdrawal is versioned, separate from service communication, forces false consent and activates hashed email suppression. Analytics remains absent/off by default, so tracking refusal cannot block enquiries.

## Observability and operations

- One Micrometer/OpenTelemetry path instruments safe route templates, status, duration, service, environment, release, correlation and trace context. Request bodies and raw URLs are not logged or used as labels. Error counters and business audit remain unsampled.
- Outbox rows carry originating correlation/trace IDs; workers restore safe MDC linkage without private identifiers. Default trace sampling is 10%; controlled tests can set 100%.
- Actuator/Prometheus remains on the loopback management connector. The optional bounded profile supplies Prometheus, Grafana, Loki, Tempo and OpenTelemetry Collector configuration with 14/7/30-day demo log/trace/metric retention.
- Dashboards cover API latency, notification age and scan age. Rules cover consecutive synthetic failures, notification and scan age, disk, backup age, sustained API errors and latency. Operator/off-host receiver values are documented placeholders, not fabricated success.

## Migration and configuration

- V10 adds safe outbox failure/manual-retry/linkage fields, provider-event deduplication, hashed suppression, privacy requests, legal holds, deletion tombstones and versioned marketing events, plus workload indexes and runtime grants.
- SES, SMS, WhatsApp and payments default disabled. Production cannot fall back to a fake live sender; disabled production email stops visibly for review.
- Angular 22.2.1/TypeScript 6.0.2/Node 24.x and Spring Boot 3.5.16/Java 21 remain pinned. The available shell used unsupported Node 23.5 and emitted its existing warning.

## Commands and actual outcomes

| Command/check                                     | Status  | Actual outcome                                                                                                                                                                                                            |
| ------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git status --short`; `git branch --show-current` | PASS    | Started clean on `main`; Phase 09 remains uncommitted.                                                                                                                                                                    |
| `backend\\mvnw.cmd verify`                        | PASS    | 40 tests passed; 2 opt-in Phase 06 provider tests skipped. PostgreSQL 17.11 applied and revalidated all ten migrations.                                                                                                   |
| Outbox reliability PostgreSQL tests               | PASS    | Ambiguous timeout became `DELIVERY_UNKNOWN` and was not reclaimed; permanent rejection stopped after one attempt. Existing quote outage/idempotency tests remained green.                                                 |
| SES callback fixtures                             | PASS    | Invalid signature and wrong topic were rejected before any database mutation. Provider event/suppression schema enforces replay deduplication.                                                                            |
| Privacy PostgreSQL tests                          | PASS    | Independent approval, single-enquiry formula-safe CSV, hold-blocked deletion, authorised scrubbing and restore tombstone replay passed.                                                                                   |
| Future payment fixtures                           | PASS    | Redirect, forged signature, replay, wrong merchant and wrong amount did not produce paid status.                                                                                                                          |
| `pnpm api:generate`                               | PASS    | Versioned privacy/provider operations regenerated deterministically after a transient Windows file lock caused by an overlapping build; the serial rerun passed.                                                          |
| `pnpm test`                                       | PASS    | Six frontend targets passed, 8 tests total.                                                                                                                                                                               |
| `pnpm build` and final `pnpm build:libs`          | PASS    | Public SSR, staff CSR and all libraries/generated clients built.                                                                                                                                                          |
| `pnpm format:check`; `git diff --check`           | PASS    | Formatting and whitespace checks passed; only Windows line-ending notices were emitted.                                                                                                                                   |
| Compose/Prometheus validation                     | PASS    | Combined base/observability Compose resolved; `promtool check rules` found seven valid rules and `promtool test rules` fired the controlled synthetic, backlog, scan, disk, backup and API-error fixtures.                |
| Automated source log inspection                   | PASS    | No logging calls referencing payload, token, cookie, presigned URL, description or request body, and no `printStackTrace`, were found. Structured test logs showed route template/status/duration/correlation/trace only. |
| Real SES domain/send/SNS callback                 | NOT RUN | No approved domain, production-access account, credentials or controlled real recipients were supplied. Nothing external was provisioned or messaged.                                                                     |
| Real Twilio/payment integration                   | NOT RUN | Explicitly disabled; provider rules/accounts/credentials were not supplied and R1 has no activation routes.                                                                                                               |
| External alert receiver delivery                  | NOT RUN | No operator receiver or off-host uptime account was supplied. Rules were executed locally; no claim of delivered paging is made.                                                                                          |

## Acceptance status

- **PASS:** outage, permanent rejection and ambiguous timeout preserve enquiries/quotes; unknown delivery is visible and not blindly resent. Bounce/complaint suppression and provider replay state are durable; forged callback fixtures cannot mutate state.
- **PASS:** demo never sends to submitted real addresses or numbers, and payments remain disabled. Future callback fixtures cannot turn redirects or mismatched/replayed notifications into payment.
- **PASS:** scoped export, holds, authorised scrubbing, tombstones and restore replay are implemented and verified. Analytics is off and marketing is separate/withdrawable.
- **PASS:** request-to-worker correlation/trace fields and MDC propagation are implemented; automated source inspection and structured test output contain no private payload/secrets. Management ports and dashboards bind privately.
- **PASS (configured and locally fired):** backlog, scan, backup, disk, synthetic and API-error alert expressions fired under `promtool`; real operator receiver delivery is explicitly **NOT RUN** because no receiver exists.

## External launch checks still required

- Approve domain ownership, sender, SPF/DKIM/DMARC, SES production access/configuration set, SNS topic/account/region, IAM and controlled recipients; run the opt-in real-service harness.
- Approve POPIA basis, operator/cross-border agreements, privacy wording, identity-evidence procedure, 12-month review policy, contract/legal retention and operator assignments.
- Configure and test a real alert receiver, off-host uptime check, backup-age publisher and quarterly restore evidence.
- Keep Twilio and payment disabled until separate official provider/rules, consent, sender, spend, merchant and reconciliation reviews are complete.

## Next-phase handoff

Reuse the provider-event dedupe/suppression tables, delivery-state contract, privacy tombstone replay, private telemetry labels and operator runbooks. A deployment phase must promote these disabled-by-default flags only through an approved environment manifest and must not interpret configured alerts or provider acceptance as delivered operational evidence.

No changes were committed or pushed.
