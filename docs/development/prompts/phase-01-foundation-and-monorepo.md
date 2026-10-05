# Phase 01 — Repository foundation and reproducible development

First iteration (R1) · Prompt pack version 1.0 · 5 October 2026

**Prerequisites:** None. This is the first implementation phase.

**Source traceability:** FR 26; SP 01–02, 21–22, 30–31, 36, 38; AR 01–05, 09, 13–16.

Copy the entire “Codex implementation prompt” section below into Codex while the project repository is open. Attach the three baseline documents or place them under `docs/source/`. Execute one phase at a time and review its report before starting the next. This file is an implementation instruction, not an estimate or an assertion that code already exists.

## Codex implementation prompt — Phase 01: Repository foundation and reproducible development

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

Write/update this phase's report at `docs/development/phase-01-report.md`, substituting the current phase number. Include files changed, architecture decisions and source mappings, migrations/configuration, commands run and actual outcomes, acceptance criteria status, limitations/provider checks still pending, and a short next-phase handoff. Use PASS/FAIL/BLOCKED/NOT RUN accurately. Then summarise this to me, list any remaining blockers, confirm that no changes were committed or pushed, and **suggest one conventional commit message without executing it**. Do not claim completion if a required check failed or was not run.

### Outcome

Create a reproducible three-tier monorepo that builds both Angular applications and a modular Spring Boot backend, starts a local PostgreSQL environment, and establishes contracts, quality checks and secure defaults. This phase creates the platform, not empty implementations of every business feature.

### Implementation tasks

1. Inspect the repository before scaffolding. If empty, establish `apps/public-web`, `apps/staff-web`, `libs/api-client`, `libs/domain-types`, `libs/ui`, `libs/design-tokens`, `backend`, `contracts`, `infra/contabo`, `infra/aws`, `ops`, `tests/e2e`, `docs/source`, `docs/adr` and `.github/workflows`. Keep one Angular CLI workspace and lockfile, Maven Wrapper for Java, and portable root commands. Avoid nested Git repositories. If code exists, adapt it without destructive recreation.
2. Select mutually compatible supported GA Java, Spring Boot, Angular, Node, package manager and PostgreSQL versions. Verify official release/support information; record exact tool versions, container references and rationale in `docs/runtime-versions.md`. Pin third-party Actions to reviewed SHAs. A version selection is a development decision, not permission to change the agreed stack.
3. Establish backend packages for content, catalogue, enquiries, assessments, quotations, media, identity, communications, payments and operations, with controller/application/domain/infrastructure boundaries. Only create working infrastructure and interfaces needed now. Add ArchUnit checks for cycles, repository leakage and controller exposure of persistence models. Enable API and worker profiles from the same source; disable HTTP serving in worker mode unless explicitly needed for a private health port.
4. Configure PostgreSQL/Flyway, separate migration/runtime credentials, UTC instants, UUIDs, optimistic version support and exact money helpers. Disable production schema auto-update and open-session-in-view. Seed typed business configuration and immutable service codes through repeatable, idempotent demo tooling rather than running production seeds automatically. Add clear environment barriers to seed/reset commands.
5. Define OpenAPI common errors, enums, pagination, timestamp/money formats, security schemes and health/public-config contracts. Document external snake_case mapping. Generate the Angular client reproducibly. CI must detect drift; choose and document whether generated files are committed. Use nested contact/location when enquiry contracts arrive.
6. Provide local Compose for PostgreSQL and necessary development dependencies, with health checks, bounded resources, persistent named database volume and example configuration containing no secrets. Introduce storage/identity/communication ports with local test adapters where needed; production profiles must reject fake authentication or fake scanning. Restrict nonpublic application endpoints by default until phase 02.
7. Create public/staff app shells with separate bundles, routing and shared design tokens. Public shell supports SSR; staff is CSR. Add a persistent demo banner and nonindexable preview headers. Do not create production-looking claims or a customer registration screen.
8. Add structured safe request logging, correlation ID validation/generation and basic private Actuator readiness/metrics. Never enable raw request-body logging. The public health response reveals no secrets or business counts. Add graceful shutdown and distinguish liveness from dependency readiness.
9. Add initial GitHub Actions for formatting, frontend type/build/unit checks, backend unit/architecture tests, PostgreSQL Testcontainers, OpenAPI generation drift and secret scanning. Workflows for untrusted PRs receive no deployment secrets. Document GitFlow, branch protections to configure, and no automatic developer commits. Provide `.gitignore`, an example environment file, contribution guidance and one-command startup/check instructions.

### Verification and acceptance

- From a clean checkout, documented commands install pinned dependencies, start PostgreSQL, migrate an empty database, build both apps and backend, and run checks successfully.
- Applying migrations twice is safe; runtime DB credentials cannot drop tables or modify schema. Reset commands refuse production.
- Public bundle contains no staff application, provider secret or AWS credential. The backend rejects an unauthenticated private request, even before staff identity is added.
- Architecture tests reject a sample forbidden dependency; generated-client drift is detectable. The worker starts independently with no public business API.
- Synthetic settings use reserved example domains/null contact numbers, logs redact hostile header values, and health endpoints expose no customer information.

### Handoff

Document exact commands, selected versions, ports, module map, contract generation and how to place the three source documents in `docs/source/`. Recommend `feat: establish monorepo and development foundation` as the unexecuted commit message.
