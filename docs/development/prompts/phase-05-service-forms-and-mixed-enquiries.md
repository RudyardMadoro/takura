# Phase 05 — Property, cabinetry, workshop and mixed-service enquiries

First iteration (R1) · Prompt pack version 1.0 · 5 October 2026

**Prerequisites:** Phase 04 board journey is working and its regression tests pass.

**Source traceability:** FR 01–03, 06–07, 10–14, 25; SP 02, 06–09, 11–12, 21–22; T03–07, T08, T12, T19–20; AAT 02, 12.

Copy the entire “Codex implementation prompt” section below into Codex while the project repository is open. Attach the three baseline documents or place them under `docs/source/`. Execute one phase at a time and review its report before starting the next. This file is an implementation instruction, not an estimate or an assertion that code already exists.

## Codex implementation prompt — Phase 05: Property, cabinetry, workshop and mixed-service enquiries

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

Write/update this phase's report at `docs/development/phase-05-report.md`, substituting the current phase number. Include files changed, architecture decisions and source mappings, migrations/configuration, commands run and actual outcomes, acceptance criteria status, limitations/provider checks still pending, and a short next-phase handoff. Use PASS/FAIL/BLOCKED/NOT RUN accurately. Then summarise this to me, list any remaining blockers, confirm that no changes were committed or pushed, and **suggest one conventional commit message without executing it**. Do not claim completion if a required check failed or was not run.

### Outcome

Extend the working board journey to all launch services using one coherent conditional quotation wizard and one enquiry reference. Preserve board selling as an independent option and keep supply-only cabinetry distinct from fix-and-supply.

### Implementation tasks

1. Enable all immutable source service codes: PROPERTY_TRANSFORMATION, CONSTRUCTION, RENOVATION, EXTENSION, MAINTENANCE, INTERIORS, CABINETRY, BOARD_SALES, BOARD_CUTTING and HARDWARE. Version each service detail schema. Share client-side presentation/validation helpers, while server-side validation remains authoritative. Do not flatten the canonical nested enquiry contract.
2. Complete four steps: Service selection; Requirements; Contact and files; Review and submit. Support 1–10 distinct services and contextual preselection from product/project/service CTAs. Back/edit preserves input; warn before removing populated service sections. Payload contains only relevant details, and cut-to-size board supply must not create duplicate cutting sections for the same work. Do not add a long-lived browser draft containing personal information.
3. Property transformation collects representative status, existing-house/additional-land/both scope and intended use. Support optional areas, unit preferences, occupancy and plans/approval status with source bounds. Do not calculate permissible units or guarantee rental returns. A nonauthorised visitor can request a general discussion, but the record flags authorisation pending before a visit. Construction/extension, maintenance/renovation and interiors use the required source fields; urgency does not promise emergency dispatch.
4. Cabinetry collects product categories and SUPPLY_ONLY/FIX_AND_SUPPLY/UNDECIDED, measuring help, optional material/finish/dimensions and site notes. OTHER requires explanation. Approximate dimensions remain UNVERIFIED. Show and retain scoped exclusions: plumbing, wiring, structural work, appliances and countertops are not silently included. Quote review later requires verified measurements and agreed fabrication/installation scope.
5. Complete cut-to-size and board-cutting qualification. Collect BUSINESS_SUPPLIED/CUSTOMER_SUPPLIED/UNDECIDED material source, ATTACHMENT/NEED_HELP input mode and FINISHED_PART_SIZE convention. Build clear instructions and a downloadable inert template defining part ID, material, thickness, finished dimensions, quantity, grain, rotation permission, four distinctly labelled edges, drilling and remarks. Do not implement an interactive editor, nesting, kerf calculations or automated manufacture.
6. Secure uploads arrive in phase 06. For this phase expose NEED_HELP as a functional route and clearly disable attachment submission rather than pretending files were saved. Server rejects unsupported attachment IDs; no browser-only fake success. Once phase 06 lands, both paths become available and mandatory cutting-attachment checks are enabled. Document this temporary phase boundary and do not call the complete R1 upload journey done yet.
7. Hardware lines collect category/item description, positive quantity and explicit EACH/PACK/LITRE/METRE or metadata-approved unit. Preserve pack size rather than silently converting units. Add optional substitute preference and delivery/collection intent. No stock balance or reservation is maintained.
8. Implement routing precedence PROPERTY → CABINETRY → BOARDS → GENERAL as configurable demo rules, singular owner and authorised collaborator grants. BOARD_SALES/BOARD_CUTTING go Boards; cabinetry goes Cabinetry; property/construction goes Property; maintenance/hardware go General. Preserve mixed details and one acknowledgement. Geographic uncertainty flags AREA_REVIEW_REQUIRED, not a service guarantee or automatic rejection.
9. Complete shared validation and review: optional budget/currency snapshot, desired date (no past specific date), 5000-character description cap, contact preference conditional requirements, current privacy notice and marketing default false. If the notice changes, retain form data and request acknowledgement of the updated notice. Field errors use stable paths and focusable summary; do not substitute unavailable variants. Server canonicalisation respects idempotent replay already committed.
10. Introduce a tested business-time calculator for first-human-response deadlines using configurable hours, timezone and holidays. Store UTC instants, show local times and preserve rule versions. Acknowledgement email does not satisfy human response. Detailed follow-up/task actions arrive in phase 07.

### Verification and acceptance

- Test standalone boards again, cut-to-size NEED_HELP, supply-only kitchen, fix-and-supply wardrobe, property assessment, phone-only maintenance, hardware packs and a mixed property/cabinetry/board request.
- Mixed request yields one reference/owner and appropriate scoped collaborators, preserving all service details and one acknowledgement event.
- Removing a service removes obsolete payload fields only after confirmation; recoverable field, network, service-unavailable and notice-change errors preserve input.
- Monday 10:00 produces Tuesday 10:00 under the nine-hour demo schedule; Sunday starts Monday 08:00 and is due Monday 17:00. Holidays and timezone boundaries are deterministic.
- Upload-dependent actions are honestly unavailable until phase 06; no file leaks or manufactured production instructions. Keyboard, zoom and mobile wizard checks pass.

### Handoff

Document every service schema, routing precedence, business-clock fixtures and phase-06 attachment integration points. Keep the board-only journey as a mandatory regression test.
