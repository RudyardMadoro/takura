# Phase 02 implementation report

## Scope and source mappings

Implemented federated staff security and configuration governance for FR 23-24 and 27; NFR 01-03; SP 01, 18, 24, 30 and 33; AR 07 and 17; T16, T17 and T23; and AAT 03-04. Requirements v1.2, Specification v1.1 and Architecture v1.0 were read from the supplied Word documents and their paragraph/table extracts. Phase 01's report was reviewed first.

The implementation remains within R1 staff identity, authorization, revocable sessions and settings. It adds no customer accounts, passwords, checkout, inventory, cutting-list editor, automatic quote generation, electronic acceptance or financial calculators.

## Files changed

- Staff CSR: OIDC configuration, memory-only security storage, bearer/session interceptors, permission guard, sign-in/recovery/logout/session-expired behavior, protected navigation and reusable 403/404 pages under `apps/staff-web`.
- Backend identity: access-token validation, session filter/service/controller, centralized permission helper, staff-access application service/controller, local OIDC provider, one-time administrator bootstrap and production guard under `backend/src/main/java/com/example/takura/identity` and shared web security.
- Configuration: settings application service/controller with typed validation and optimistic concurrency.
- Persistence: `V2__federated_staff_security.sql` for identities, roles, teams, explicit grants, sessions and security audit events.
- Contracts: session, staff-access and settings routes/schemas in OpenAPI plus regenerated TypeScript client.
- Operations/documentation: six synthetic local identities and separated grants in `ops/demo-data.sql`; provider claim, permission, recovery and bootstrap guidance in `docs/security/staff-federation.md`.
- Tests: access-token contract, injected-clock session behavior, migration count/replay and existing architecture/security coverage.

## Architecture decisions and security behavior

- Pinned `angular-auth-oidc-client` 22.0.1. Authorization Code with PKCE, state and nonce is used. Browser token storage is replaced with an in-memory implementation; refresh tokens and silent renewal are disabled. A reload or separate tab requires interactive authentication and a new local session.
- Spring Security validates signature through configured JWKS, issuer, standard time claims, exact audience, Cognito-style `client_id`, `token_use=access`, required scope, signed `auth_time`, and `amr` containing `mfa`. ID tokens cannot authorize the API. CORS allows only configured staff origins and does not allow credentials.
- A staff identity is unique by issuer and subject. Roles, teams and explicit operations are independent. Administrator status itself grants neither enquiry access nor quote approval. The shared `PermissionService` is the required application-service guard for future record, export and download paths.
- Session handles are 256-bit random values; only SHA-256 hashes are stored. They are bound to issuer, subject and client. Creation serializes on the identity, revokes prior active sessions, requires authentication within five minutes and newer than the revocation boundary, and anchors the eight-hour limit to `auth_time`. GET/HEAD/polling does not extend the 30-minute idle limit; trusted mutating API actions do.
- Deactivation and every grant update revoke sessions. The next request reloads active state and grants. Final active-administrator removal is rejected. `/admin/users` means external-subject access grants, not passwords or provider account management.
- Staff/settings updates require `If-Match`; absent headers return 428 and stale revisions return 412. Audit rows store actor, target and action only, without request payloads.
- The synthetic local OIDC provider exists only in the `local` profile, uses fixed synthetic identities, issues ten-minute RSA-signed access tokens and has an explicit `mfa` simulation switch. A production startup guard rejects the local-provider property.

## Migration and configuration

- Flyway V2 adds `staff_identity`, `staff_role`, `staff_team`, `staff_grant`, `staff_session` and `security_audit_event`, plus typed-setting validation.
- Configurable keys: issuer, JWKS URI, client ID, API audience, required scope, allowed origins, idle timeout, absolute timeout and fresh-authentication window.
- The operator bootstrap is disabled by default and refuses to run if any identity already exists. It grants staff-access/settings administration only and writes an audit event.
- Demo data contains Demo Owner, Coordinator, Estimator, Approver, Editor and Reviewer. Content Editor has only `content:write`; Demo Owner has no enquiry or quote-approval operation.

## Commands run and actual outcomes

| Command or check | Status | Actual outcome |
| --- | --- | --- |
| Baseline DOCX paragraph/table review | PASS | All three required versions and mapped sections were present. |
| Official GA compatibility check | PASS | Angular 22.2/TypeScript 6.0/Node 24 and Spring Boot 3.5.16/Java 21 remain supported; OIDC client 22.0.1 is current. |
| `pnpm add -w angular-auth-oidc-client@22.0.1 --save-exact` | PASS | Dependency and lockfile updated. |
| `backend/mvnw.cmd verify` | PASS | 11 tests, zero failures/errors/skips; includes PostgreSQL 17 migration replay, JWT claim matrix, injected-clock timeout behavior and architecture rules. |
| `pnpm test` | PASS | Six test files and eight tests passed. |
| `pnpm build` | PASS | Public SSR, staff CSR and all libraries built. The host used Node 23.5 and emitted the expected non-LTS warning; the repository remains pinned to Node 24.19. |
| `pnpm format:check` | PASS | Repository formatting passed. |
| `pnpm api:generate` | PASS | OpenAPI Generator reproduced and formatted the updated client. |
| `pnpm api:check` | FAIL | The command compares generated files with committed HEAD, so it correctly reports this phase's uncommitted generated-client additions as a diff. No staging/commit was allowed; deterministic regeneration completed. |
| Local database migration | PASS | Existing local schema migrated from V1 to V2. |
| Demo seed twice | PASS | First run added 6 identities, 6 roles and 9 grants; second run added zero records. |
| Local API/provider runtime | BLOCKED | Migration and context initialization succeeded, but port 8080 was already occupied. The provider browser flow was therefore not exercised end to end. |
| Real Cognito/upstream IdP/MFA | NOT RUN | No tenant credentials or approved external accounts were supplied. |

## Acceptance status

| Criterion | Status | Evidence or limitation |
| --- | --- | --- |
| Newly federated subject has zero access until provisioned; editor has no lead access | PASS | Session creation requires an existing active identity; separated synthetic grants demonstrate editor-only content access. |
| Wrong token contract, cross-identity/client handle and handle without JWT fail | PASS | JWT contract matrix and subject/client-bound session query; security chain requires bearer JWT before the session filter. Wrong signature/issuer/expiry use Spring Security's standard validators. |
| Polling cannot extend idle; refreshed JWT/repeated POST cannot extend eight hours | PASS | Injected-clock tests and database constraint anchor absolute expiry to original authentication; creation requires fresh `auth_time`. |
| Logout, deactivation and grant removal affect next request | PASS | DELETE revokes; update revokes all sessions; verification reloads active state and operations on every request. |
| Tokens are not persisted or logged | PASS | Custom memory storage, no refresh token, request-body logging disabled and no token logging added. The bundled library contains unused session-storage implementation code, but the application provider overrides it. |
| Concurrent grant/settings updates and final administrator safety | PASS | Row revision predicates yield 412; missing precondition yields 428; identity update prevents removing the final active administrator. |
| Production rejects local provider | PASS | Provider bean is local-profile-only and production startup guard rejects explicit local-provider enablement. |
| End-to-end local provider browser flow and real Cognito MFA paths | BLOCKED | Local port conflict prevented browser flow; real provider credentials are absent. |

Overall phase status: **BLOCKED**. Implementation and automated checks pass except the deliberately HEAD-relative generated-client check, but the required local browser/provider flow was not exercised because port 8080 was occupied, and real Cognito/federated MFA evidence remains a production-readiness blocker.

## Limitations and next-phase handoff

- Clear port 8080 (or make the local issuer/provider port consistently configurable) and run the full PKCE/MFA/session/logout browser journey.
- Verify Cognito access-token claims and JWKS rotation with the real user pool, then test every admitted Google Workspace or Entra federation path for enforced MFA. Do not weaken local validation while this remains pending.
- Add browser accessibility automation and direct concurrent HTTP tests for the A10/A11 screens when their full editable forms are styled.
- The pre-existing developer change from database port 15432 to 5433 in `application.yaml` was preserved; runtime verification used an explicit `DATABASE_URL` override.
- Phase 03 modules must call `PermissionService` inside application services before resolving records, exports, files or object URLs, and must use the staff principal created by the session filter.

Recommended developer branch: `feature/phase-02-federated-staff-security` from `develop` after reviewing the current uncommitted work.

Suggested commit message, not executed: `feat: add federated staff security and configuration governance`

No files were staged, committed or pushed; no branch, tag or pull request was created.
