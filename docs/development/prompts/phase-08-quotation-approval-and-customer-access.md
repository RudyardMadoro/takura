# Phase 08 — Quotation revisions, approval, issue and secure customer viewing

First iteration (R1) · Prompt pack version 1.0 · 5 October 2026

**Prerequisites:** Phases 01–07 complete; scanned private PDFs, outbox and state guards work.

**Source traceability:** FR 19–20; SP 07, 15–18, 21–24, 34–35; AR 08, 17; T13–16; AAT 06.

Copy the entire “Codex implementation prompt” section below into Codex while the project repository is open. Attach the three baseline documents or place them under `docs/source/`. Execute one phase at a time and review its report before starting the next. This file is an implementation instruction, not an estimate or an assertion that code already exists.

## Codex implementation prompt — Phase 08: Quotation revisions, approval, issue and secure customer viewing

You are implementing this phase in the existing project repository. Make the changes and run the relevant checks; do not stop at a plan. Limit implementation to this phase and repair prerequisite defects only when necessary, recording the reason. Do not implement the next phase automatically.

### Read first and working rules

1. Read applicable `AGENTS.md`, the repository README, existing code and `docs/source/Property_Transformation_Website_Requirements_Updated.docx` (v1.2), `docs/source/Property_Transformation_Website_Specification_Updated.docx` (v1.1), and `docs/source/Property_Transformation_Website_Architecture.docx` (v1.0). If Word files cannot be read directly, extract paragraphs AND tables with an available document reader. Keep optional extracted Markdown alongside the source and record its version. Read prior phase reports under `docs/development/`. If a source document is missing, identify it and ask for that document before implementing rules that depend on it; do not invent its contents.
2. Check `git status` and the current branch first. Preserve unrelated work. **Do not run git add, git commit, git push, create tags, merge branches, or open/merge pull requests automatically.** Do not discard, reset, stash, rebase or overwrite the developer's work. Work on the current branch; recommend the appropriate `feature/*` branch from `develop` for the developer to create. CI workflow files may describe authorised future builds/deployments, but must not commit source changes. At completion suggest a commit message only; leave all changes uncommitted.
3. Follow the agreed Angular public SSR/staff CSR, Java Spring Boot modular monolith, PostgreSQL/Flyway and GitHub monorepo architecture. Use the pinned version manifest and lockfiles; at kickoff verify supported GA compatibility against official documentation and pin versions. Never silently replace the stack or introduce microservices, Redis, Kafka, Kubernetes or customer accounts.
4. Use specification section 3 dummy values, versioned typed configuration and visibly synthetic fixtures. Demo contacts remain disabled, email goes only to a test sink, and preview/staging stay nonindexable. Never invent credentials, capacity, testimonials, qualifications, completed client work or investment returns. Missing real business values do not block development.
5. Implement security, validation, error handling, accessibility and relevant tests with each feature. Private endpoints are deny-by-default; UI hiding is not authorisation. Never log contact text, plans, tokens, cookies, presigned URLs, raw webhook bodies or secrets. Keep asynchronous work out of the enquiry transaction and request latency path.
6. Do not provision paid infrastructure, send real messages, charge payments, deploy to production, mutate live data or configure external accounts merely by executing this prompt. Produce runnable local/staging configuration and safe documented commands. Where provider credentials are absent, use explicit local adapters and report the unverified integration; do not mark it tested against the real provider.
7. Use `/api/v1`, versioned OpenAPI, generated TypeScript clients, nested `contact`/`location`, external snake_case, exact monetary values, stable error codes, correlation IDs, optimistic concurrency and idempotency as specified. Do not expose persistence entities. Public forms remain anonymous; staff and customer quote sessions are distinct.
8. Keep R2/R3 features absent or disabled: no checkout, stock reservations, live inventory, cutting-list editor, automatic quote generation, electronic acceptance, financial calculators or native app. Build only the explicitly requested extension contracts and isolated fixtures.

### Required completion report

Write/update this phase's report at `docs/development/phase-08-report.md`, substituting the current phase number. Include files changed, architecture decisions and source mappings, migrations/configuration, commands run and actual outcomes, acceptance criteria status, limitations/provider checks still pending, and a short next-phase handoff. Use PASS/FAIL/BLOCKED/NOT RUN accurately. Then summarise this to me, list any remaining blockers, confirm that no changes were committed or pushed, and **suggest one conventional commit message without executing it**. Do not claim completion if a required check failed or was not run.

### Outcome

Deliver the R1 quotation lifecycle using staff-prepared PDFs, independent approval, immutable issue history and revocable customer access. Do not implement automatic pricing/PDF generation, online acceptance or payments.

### Implementation tasks

1. Create quote groups and revision tables with unique quote/revision numbers, enquiry linkage, clean PDF ID/version/checksum, exact amount/currency/tax mode, dates, scope, reviewed commercial terms and evidence snapshots. Demo amount ZAR 2500.00 is a labelled fixture only. Expiry uses the configured 14-calendar-day rule and 17:00 local expiry instant; preserve original configuration. Use decimal strings/BigDecimal or explicit minor units, never binary floating-point totals.
2. Build A06 draft/review/approval/issue screens. Staff uploads a prepared PDF through the protected media flow; record that metadata and PDF amount agree via review checklist. Capture board variant/count/processing/delivery basis, cutting-list version, cabinetry fulfilment/verified measurements/materials/installation/exclusions, or property scope/approvals assumptions as applicable. Pending production instructions cannot be treated as fabrication approval.
3. Implement DRAFT → AWAITING_APPROVAL → APPROVED → ISSUED with source cancellation/edit rules. Bind approval to exact PDF checksum AND material metadata/terms digest. Editing either invalidates approval and returns to DRAFT. Demo self-approval is disabled and requires separate Estimator/Approver; administrator alone has no approval privilege. Guards run server-side under concurrency, so an edit cannot race an approval or issue.
4. Issue command checks clean PDF, complete metadata, approval, contact route, permissions and expiry; commits immutable snapshot, customer grant, issue event and durable notification atomically. Repeated issue/dispatch commands are idempotent. Preserve issued records even if delivery fails. New draft does not supersede previous issued quote; issuing replacement does and invalidates old access according to demo policy.
5. Integrate phase-07 lead state: display issue pending dispatch until provider accepts delivery or authorised staff records manual evidence. Only then move to QUOTE_SENT. Mail acceptance differs from confirmed inbox delivery/reading. Use delivery callbacks/interface that phase 09 will implement; demo sink provides explicit acceptance/unknown/failure fixtures. For phone-only customers support a controlled manual delivery workflow without inventing an email address.
6. Generate cryptographically random customer token with at least 128-bit entropy, store only a hash, scope to one revision and cap expiry at quote expiry/14 days. Use `/quote/view#...` fragment, POST `/quote-access/exchange`, scrub fragment immediately and establish a short-lived narrowly scoped session. Return generic invalid-token responses, rate limit exchange and never log raw token/fragment/session. Do not store raw secrets in ordinary outbox payloads; use a secure issuance/encrypted delivery mechanism with bounded retention and redaction.
7. Build P17 customer quote view using CSR, no-store headers, noindex, no third-party scripts and restricted referrer policy. Authorise each metadata/PDF request against grant/session expiry, revision state and revocation. Proxy PDF downloads through API for immediate server-side revocation, avoiding long-lived presigned links. Stream bounded bytes after access check, include safe filename and proper response headers; do not cache private PDFs at nginx/CDN/service worker.
8. Revoke command requires privilege/reason, stops new exchange and existing session requests, audits outcome and retains issued evidence. Superseded/revoked downloads are hidden in demo. Expired view shows state/contact guidance without Accept/Pay controls. Previously downloaded bytes cannot be recalled; describe this inherent limit in staff guidance, not as a promise of remote erasure.
9. Record ACCEPTED_EXTERNALLY/DECLINED/NO_RESPONSE with exact revision, actor, date and commercial evidence. Only authorised confirmed acceptance enables WON. Opening/downloading never implies acceptance or payment. No automated construction/cutting process starts from issue or acceptance.

### Verification and acceptance

- Draft/unclean/incomplete/unapproved quote cannot issue. Changed PDF or metadata invalidates approval; self-approval is rejected; concurrent edits cannot issue a different snapshot than approved.
- Repeated issue creates one revision/grant/event. Delivery outage retains quote and prior enquiry stage; accepted/manual evidenced dispatch moves to QUOTE_SENT exactly once.
- Replacement draft leaves original valid; issued replacement supersedes it. Invalid/expired/revoked/superseded access follows policy on every request, including an already active customer session.
- Wrong enquiry/revision/identity cannot access PDF. No token leaks into logs, referrers, persistent browser storage, SSR caches or analytics. Revocation blocks subsequent proxied downloads.
- Phone-only manual dispatch and externally recorded acceptance work with audit. No Accept online/Pay/cart or automatic quote generation appears.

### Handoff

Provide quote-state/approval digest rules, secure delivery-secret design, offline outcome workflow, revocation tests and the communication hooks needed in phase 09.
