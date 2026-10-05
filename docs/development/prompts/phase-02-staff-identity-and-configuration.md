# Phase 02 — Federated staff security and configuration governance

First iteration (R1) · Prompt pack version 1.0 · 5 October 2026

**Prerequisites:** Phase 01 builds and migrates successfully.

**Source traceability:** FR 23–24, 27; NFR 01–03; SP 01, 18, 24, 30, 33; AR 07, 17; T16, T17, T23; AAT 03–04.

Copy the entire “Codex implementation prompt” section below into Codex while the project repository is open. Attach the three baseline documents or place them under `docs/source/`. Execute one phase at a time and review its report before starting the next. This file is an implementation instruction, not an estimate or an assertion that code already exists.

## Codex implementation prompt — Phase 02: Federated staff security and configuration governance

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

Write/update this phase's report at `docs/development/phase-02-report.md`, substituting the current phase number. Include files changed, architecture decisions and source mappings, migrations/configuration, commands run and actual outcomes, acceptance criteria status, limitations/provider checks still pending, and a short next-phase handoff. Use PASS/FAIL/BLOCKED/NOT RUN accurately. Then summarise this to me, list any remaining blockers, confirm that no changes were committed or pushed, and **suggest one conventional commit message without executing it**. Do not claim completion if a required check failed or was not run.

### Outcome

Deliver secure staff sign-in, the local authorisation registry, revocable sessions and administrative configuration. Every later staff feature must use these server-side guards. No staff passwords or public customer accounts are created.

### Implementation tasks

1. Integrate a maintained Angular OIDC client using Authorization Code with PKCE, state and nonce. Add protected CSR staff routes, sign-in, provider recovery link, logout, loading/error states and accessible focus handling. Keep access tokens in memory, never localStorage; do not persist refresh tokens. Document tab/reload behaviour and interactive reauthentication. A ten-minute access token is a configurable target, not a hardcoded provider promise.
2. Configure Spring Security resource-server JWT validation: signature, trusted issuer/JWKS, expiry, not-before, required scopes, access-token type, and the exact audience/client binding. For Cognito validate `token_use=access` and `client_id` according to its access-token contract; ID tokens never authorise the API. Test wrong key, issuer, type, client, scope and expiry. Configure explicit origins and trusted proxy behaviour; do not add permissive CORS.
3. Implement StaffIdentity keyed uniquely by issuer/subject, display label, active state, teams, roles and explicit operation/team/record grants. A first-time federated subject has zero access. Do not auto-map arbitrary provider groups to administrator. Use the source permission matrix: administrator status alone grants neither enquiry access nor quote approval. Centralise scope checks in application services so copied IDs and export/download paths are protected.
4. Implement POST/GET/DELETE `/api/v1/admin/session`. Private requests require a valid access JWT plus `X-Staff-Session` bound to subject, issuer and client. Store only a safe hash of the random handle. Enforce 30-minute idle and eight-hour absolute expiry; the latter anchors to verified original authentication time. Session creation requires signed authentication time within the configurable five-minute window and newer than the revocation boundary. Old/refreshed tokens cannot recreate an expired session or reset the absolute window.
5. Define trusted activity classification server-side; ordinary polling cannot extend idle time. Do not let a caller label every request interactive to bypass timeout. Revoke on logout/deactivation and deny the next request after grant removal. Concurrent session creation must not bypass bounds. Enforce MFA through the admitted provider paths and evidence claims/contract; document any production federation gap as a readiness blocker.
6. Supply a development-only OIDC provider with synthetic identities, matching token/session semantics and an explicit MFA simulation. It must be impossible to enable in production accidentally. Provide separate Demo Owner, Coordinator, Estimator, Approver, Editor and Reviewer grants. Bootstrap the first administrator via an audited one-time operator command for an approved subject, never an open registration endpoint; retain at least one active authorised administrator and document recovery.
7. Build A10 Staff access management and A11 Settings: provisioning approved external subjects, deactivation, grants, teams, configuration history and typed validation. If retaining the source `/admin/users` path, explicitly document that it means access grants, not passwords. Use ETag/If-Match: missing precondition 428, stale update 412. Record actor/target/action without sensitive payloads. Settings expose DEMO/PENDING/CONFIRMED/RETIRED status and revisions; public-config returns an allowlist only.
8. Add reusable authorised-navigation/403/404 patterns and session-expired UX. Client behaviour mirrors permissions but never becomes their authority. Sanitize labels, prevent privilege escalation through request-body fields and protect cookie-based mutations against CSRF if cookies are used.

### Verification and acceptance

- A valid newly federated identity cannot enter staff business screens or enumerate records until provisioned. Content Editor has content grants and no lead access.
- Wrong token types/claims and session handles from another identity/client are rejected. A handle without JWT grants nothing.
- With an injected clock, polling does not prevent idle expiry; eight hours cannot be extended by refreshed JWTs or repeated POST session. Fresh interactive reauthentication succeeds only with valid evidence.
- Logout, deactivation and grant removal take effect on the next API request. Old tokens cannot undo revocation. No tokens appear in browser persistent storage, logs or generated bundles.
- Concurrent grant/settings updates fail safely, and deactivating the final administrator is prevented. Production rejects the local provider profile.

### Handoff

Provide the provider claim contract, permission helper usage, bootstrap/recovery instructions, configuration dictionary and tests for new modules to reuse. Record real Cognito/IdP/MFA checks still pending without weakening local validation.
