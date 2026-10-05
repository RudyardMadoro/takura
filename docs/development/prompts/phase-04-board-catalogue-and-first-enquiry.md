# Phase 04 — Standalone board catalogue and board-only vertical slice

First iteration (R1) · Prompt pack version 1.0 · 5 October 2026

**Prerequisites:** Phases 01–03 complete; identity and publication guards available.

**Source traceability:** FR 07, 10–12, 16–18, 21, 28; SP 04, 06, 08, 11–12, 19, 21–23, 35; AR 03, 08, 10, 16; T02, T07–08, T11; AAT 02.

Copy the entire “Codex implementation prompt” section below into Codex while the project repository is open. Attach the three baseline documents or place them under `docs/source/`. Execute one phase at a time and review its report before starting the next. This file is an implementation instruction, not an estimate or an assertion that code already exists.

## Codex implementation prompt — Phase 04: Standalone board catalogue and board-only vertical slice

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

Write/update this phase's report at `docs/development/phase-04-report.md`, substituting the current phase number. Include files changed, architecture decisions and source mappings, migrations/configuration, commands run and actual outcomes, acceptance criteria status, limitations/provider checks still pending, and a short next-phase handoff. Use PASS/FAIL/BLOCKED/NOT RUN accurately. Then summarise this to me, list any remaining blockers, confirm that no changes were committed or pushed, and **suggest one conventional commit message without executing it**. Do not claim completion if a required check failed or was not run.

### Outcome

Deliver the first complete commercial journey: an anonymous visitor browses boards, requests full sheets, receives a committed reference, and an authorised staff member sees the request in the Boards Team inbox. The request is not an order, reservation or payment.

### Implementation tasks

1. Implement BoardProduct/BoardVariant and supporting HardwareItem schemas, indexes, public DTOs and A09 catalogue management. Variants contain SKU/internal code, material/type, finish, thickness_mm, sheet_length_mm, sheet_width_mm, unit and explicit availability wording. Use RAW for undecorated MDF/plywood. Seed three demo variants from SP 30, sourced-on-request wording and no live stock counts. Archive variants rather than deleting historical references.
2. Build `/boards`, `/boards/{slug}` and `/hardware` with URL-driven type/finish/thickness/sheet-size filters, back-navigation preservation, stable pagination, useful empty/error states and accessible variant selection. Public detail shows sheet dimensions, unit and collection/delivery expectations. Supporting hardware distinguishes supplies such as paint from painting labour. Public prices remain hidden by default. No Add to Cart or persistent browsing basket.
3. Implement versioned `/catalogue` APIs that publish only enabled, cleared entries; exclude internal costs/stock fields. Catalogue editors need explicit grants and If-Match. Preserve specification revisions so changes cannot rewrite previous enquiry snapshots. Use SSR/hydration and publication invalidation from phase 03.
4. Build the board-first `/request-quote` path using the four-step framework. Allow one to ten lines with selected published variant or free-text specification, FULL_SHEET quantity 1–9999, explicit unit, collection preference and optional substitute preference. Full-sheet customers need no cutting list, installation or construction selection. Unknown specification supports staff clarification without a made-up variant. At this phase expose only implemented services; later selections are enabled in phase 05.
5. Implement `/api/v1/enquiries` with nested contact/location and current privacy notice. Validate shared fields from SP 06, including usable EMAIL or CALL/WHATSAPP route, name, description, suburb/country, marketing default false and no mandatory email for phone-only enquiries. No exact street address is required. Do not enable a real contact channel using a dummy number.
6. Save enquiry, variant snapshots, relevant configuration versions, singular owner, reference, idempotency result and notification events in one PostgreSQL transaction. Use a random internal UUID and unique friendly reference. Idempotency-Key is required: matching body returns recorded success before changed catalogue/privacy validation; different body returns 409. Handle concurrent first submissions with uniqueness and transactional retry. Never show success before commit.
7. Route board enquiries to active Boards coordinator, otherwise the scoped unassigned queue. Do not assign disabled staff. Implement the minimum A02/A03/A04 staff inbox/list/detail required to review this slice, with team/record scope, stable pagination, filtered counts and no public reference lookup. Staff authorisation must run on detail/list/count APIs alike.
8. Implement the durable outbox foundation and worker: SKIP LOCKED bounded leases, commit before external calls, expired lease recovery, unique semantic events and safe trace context. For now the email adapter renders acknowledgements and safe staff alerts to the demo sink only. Enquiry persistence must succeed even when the sink/provider fails. Phone-only enquiries create no failed email task. Full SES behaviour is phase 09.
9. Add safe abuse quotas, server-side input bounds, stable domain errors, client focusable error summary, transient retry handling and draft preservation. On an uncertain response, reuse the same idempotency key/body; changing form content creates a new key only deliberately. Remove submitted data only after success.

### Verification and acceptance

- End-to-end: two full sheets without files/construction/account → one reference → correct scoped Boards inbox → one acknowledgement event in sink. Demo contacts stay disabled.
- Phone-only route succeeds, shows an on-screen receipt and creates no missing-email failure.
- Concurrent same-key/same-body requests yield one enquiry, one event and the original response. Changed body with same key returns 409. Replay still works after product or privacy notice changes.
- Product disabled during form entry yields a recoverable error preserving input, never an automatic substitution. Historical requests retain old product specifications.
- Coordinator unavailable leaves a visible unassigned request. Content Editor and out-of-scope Reviewer cannot list/view it by copied ID or reference.
- Worker crash/lease expiry is recoverable; no database locks remain held during sink calls; sink failure does not erase the enquiry.

### Handoff

Record the nested enquiry contract, routing rules, snapshot strategy, outbox lifecycle and board-only browser test as the baseline regression journey for all remaining phases.
