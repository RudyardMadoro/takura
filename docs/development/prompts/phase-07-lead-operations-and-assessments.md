# Phase 07 — Staff lead management, tasks and assessments

First iteration (R1) · Prompt pack version 1.0 · 5 October 2026

**Prerequisites:** Phases 01–06 complete; scoped inbox, files, routing and business clocks work.

**Source traceability:** FR 17–18, 23–24; SP 12–14, 18, 21–24, 35; T11–12, T16–17; AAT 03–04, 07.

Copy the entire “Codex implementation prompt” section below into Codex while the project repository is open. Attach the three baseline documents or place them under `docs/source/`. Execute one phase at a time and review its report before starting the next. This file is an implementation instruction, not an estimate or an assertion that code already exists.

## Codex implementation prompt — Phase 07: Staff lead management, tasks and assessments

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

Write/update this phase's report at `docs/development/phase-07-report.md`, substituting the current phase number. Include files changed, architecture decisions and source mappings, migrations/configuration, commands run and actual outcomes, acceptance criteria status, limitations/provider checks still pending, and a short next-phase handoff. Use PASS/FAIL/BLOCKED/NOT RUN accurately. Then summarise this to me, list any remaining blockers, confirm that no changes were committed or pushed, and **suggest one conventional commit message without executing it**. Do not claim completion if a required check failed or was not run.

### Outcome

Complete the staff operational workflow so enquiries have accountable owners, human-response evidence, follow-up tasks and controlled assessment appointments. Staff permissions and state guards apply to every action.

### Implementation tasks

1. Complete A02 dashboard, A03 list and A04 detail. Show scoped new/unassigned/overdue/scan/quote queues and filters by service, team, owner, state, date and area. Use keyset pagination, stable sort and default 25/max 100 rows. Counts and exports cannot disclose records outside the caller's scope. Protect enquiry writes with ETag/If-Match and allow users to refresh/reapply intentionally after 412, never silent overwrite.
2. Implement assignment commands with singular active owner, permitted teams and explicit collaborators. Unavailable coordinator remains unassigned until authorised reassignment. Deactivation flags/reassigns outstanding tasks through controlled policy; it never silently gives another user broad access. Reject arbitrary owner/grant changes through ordinary PATCH fields.
3. Implement append-only contact/activity evidence, first completed human response, follow-up tasks (owner, due time, purpose, completion/postponement reason) and safe reminders. Failed contact attempts do not stop the first-response clock. Overdue is a derived display condition, not an enquiry status. Reminders follow business hours and exclude CLOSED/LOST/SPAM requests. Unique scheduled event keys prevent duplicates across concurrent workers.
4. Implement the exact SP 13 transition table for NEW, CONTACTED, AWAITING_INFORMATION, ASSESSMENT_SCHEDULED, ASSESSMENT_COMPLETE, QUOTE_IN_PREPARATION, QUOTE_SENT, WON, LOST, CLOSED and SPAM. CONTACTED requires contact evidence; assessment completion requires findings; QUOTE_SENT later requires issued quote plus dispatch evidence; WON requires authorised external commercial confirmation. Boards may bypass assessment via CONTACTED → QUOTE_IN_PREPARATION.
5. Reopen/override commands require specific elevated grants, reasons and audit; an override cannot bypass authentication, file safety, quote approval or data-scope restrictions. Do not provide a generic unrestricted state PATCH. For quote-related transitions, introduce the guarded interface used by phase 08, keeping transitions unavailable until valid evidence exists.
6. Implement A05 assessments with PROPOSED/CONFIRMED/COMPLETED/CANCELLED/NO_SHOW, assigned staff, start/end, remote/private location, findings and notes. Date preferences are not confirmed bookings. Check active assignee, required authorisation for property access, and overlapping confirmed visits. Protect against concurrent booking races using transactional locking/constraint strategy, not a UI-only overlap check. An override needs explicit privilege and audit.
7. Add accessible responsive tables/detail sections/dialogs and meaningful action labels. Dialogs scale to mobile without hidden buttons; focus, Escape/cancel and validation summaries are consistent. Explain irreversible consequences in UI confirmations; avoid confirmation clutter on ordinary saves. Use Angular Material where appropriate for staff controls, not in public bundles.
8. Extend A12 audit/notification views with redacted operational metadata, event attempts and safe manual retry hooks for phase 09. Audit application actions independently from sampled tracing. Access to audit itself is restricted. Do not expose private notification bodies to every staff user.
9. Add cutting-specification review controls for LIST_REVIEW_PENDING, NEEDS_CLARIFICATION and SPECIFICATIONS_CONFIRMED, separate from enquiry/quote state. Retain reviewed attachment version, dimensions/material/processing confirmation and customer approval evidence. Production sign-off is a distinct authorised, audited action referencing that exact confirmed version; receiving a file or issuing a quote never starts machinery. Demo confirmations remain synthetic.
10. Add module-owned indexes and queries for inbox/task/assessment workloads, explicit DTO fetching and tests against N+1 queries. Keep exports and overdue reporting from monopolising enquiry-write connections. Instrument safe queue and response-time metrics.

### Verification and acceptance

- Scope checks hold across dashboard count, list, detail, assignment, task, assessment, file and audit endpoints; copied IDs do not leak existence or data.
- Concurrent edits return 412 and preserve the other user's update. Inactive owner cannot receive new work; unassigned queue remains operational.
- Business-time fixtures include holidays, Monday/Sunday, paused/closed reminders and first human contact. Repeated schedulers create one event per reminder purpose/window.
- Disallowed state transitions fail with stable STATE_CONFLICT; closure/reopen require evidence and grants. Draft quote/queued message cannot set QUOTE_SENT.
- Concurrent confirmed appointments cannot overlap for the same employee without audited override. Completion without findings is denied; cancellation updates workflow correctly.
- Staff UI is usable by keyboard and on narrow screens; no mutation depends solely on disabled buttons. Audit does not contain full contact text, tokens or file bytes.

### Handoff

Provide the state/assessment command map, permissions, evidence requirements, business-clock behaviour and interfaces for quote dispatch and external commercial confirmation in phase 08.
