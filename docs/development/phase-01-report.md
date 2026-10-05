# Phase 01 implementation report

## Scope and source mappings

Implemented the reproducible monorepo foundation for FR 26; SP 01-02, 21-22, 30-31, 36 and 38; AR 01-05, 09 and 13-16. The source Word documents were read as Requirements v1.2, Specification v1.1 and Architecture v1.0. Mechanical Markdown extracts beside each source preserve paragraphs and tables for review.

The implementation is limited to platform foundations. It does not add checkout, reservations, live inventory, a cutting-list editor, quote generation/acceptance, financial calculators, customer accounts, microservices, Redis, Kafka or Kubernetes.

## Files changed

- Root workspace: `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, Angular configuration, formatting rules, ignore rules, `compose.yaml`, `.env.example`, README and contribution guide.
- Frontend: `apps/public-web`, `apps/staff-web`, `libs/api-client`, `libs/domain-types`, `libs/ui` and `libs/design-tokens`.
- Backend: Spring Boot Maven project and wrapper under `backend`, module boundary packages, API/worker configuration, request security/logging, Flyway migration and unit/architecture/Testcontainers tests.
- Contracts: OpenAPI 1.0 contract, generator configuration and committed generated TypeScript Angular client.
- Local operations/infrastructure: PostgreSQL role bootstrap, guarded seed/reset scripts, Contabo/AWS placeholders, module map and E2E test placeholder.
- Governance: pinned GitHub Actions workflow, runtime version manifest and ADR 0001.
- Source traceability: paragraph/table extracts under `docs/source` and this report.

## Decisions and migrations

- Selected Node 24.19.0 LTS, pnpm 11.25.0, Angular 22.2.1, TypeScript 6.0.2, Java 21.0.10 LTS, Spring Boot 3.5.16, Maven 3.9.11 and PostgreSQL 17.11. PostgreSQL 17 was selected over 18 because the Spring Boot-managed Flyway version explicitly reports support through PostgreSQL 17.
- Public and staff applications are separate Angular bundles. Public routes use SSR/prerender; unknown routes return a real 404. Staff is CSR only. Both preview shells are nonindexable and show persistent synthetic-demo banners.
- Backend module names match the architecture. ArchUnit checks cycles, repository access and controller-to-persistence leakage. A forbidden test fixture proves the exposure rule detects a violation.
- Private HTTP access is denied by default. Public health returns only `status`; public config contains reserved `example.invalid`/blank contact data. Caller correlation IDs are constrained to a safe character set and length before response/logging context use. Request bodies are not logged.
- `V1__foundation.sql` creates typed/versioned business settings and immutable service codes. Flyway uses `takura_migrator`; application access uses `takura_runtime`. Tests prove migration replay executes zero additional migrations and the runtime user cannot create or drop schema objects.
- Demo seed data is separate from Flyway production migrations, deterministic and idempotent. Reset/seed scripts enforce local/preview/test barriers.
- Generated client files are committed; `pnpm api:check` regenerates/formats and detects tracked drift in CI.
- The worker uses the same artifact with `worker` profile, `web-application-type: none`, a four-connection pool and a no-op scheduling anchor for future bounded leases. No HTTP port is opened.

## Configuration and setup

- PostgreSQL binds to `127.0.0.1:15432` to avoid common locally installed PostgreSQL ports. The named volume mounts `/var/lib/postgresql`, compatible with current official images.
- API defaults: 8080. Private management defaults: loopback 9090. Public SSR defaults: 4000. Angular development: public 4200, staff 4201.
- Example credentials are explicitly local-only. Production disables fake authentication/scanning, Flyway clean and schema auto-update. No provider credentials are present.
- Local communication accepts only `@example.invalid` recipients. Payment is an interface-only disabled R3 extension with no route or implementation.

## Commands run and actual results

| Command/check                                                  | Actual outcome                                                                                                                                                                                                                                                                 |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| DOCX paragraph/table extraction using bundled document runtime | PASS - Architecture 118 paragraphs/6 tables; Requirements 209/8; Specification 224/18.                                                                                                                                                                                         |
| Official version/support verification                          | PASS - Angular, Node.js, Spring Boot, PostgreSQL and official Postgres image sources checked on 5 October 2026.                                                                                                                                                                |
| `pnpm install`                                                 | PASS - lockfile created with exact direct versions.                                                                                                                                                                                                                            |
| `pnpm format:check`                                            | PASS after formatting runtime manifest.                                                                                                                                                                                                                                        |
| `pnpm test` with pinned Node 24 runtime                        | PASS - six frontend/library test files, eight tests.                                                                                                                                                                                                                           |
| `pnpm build` with pinned Node 24 runtime                       | PASS - public browser/SSR, staff CSR and four libraries.                                                                                                                                                                                                                       |
| `pnpm api:check`                                               | PASS - OpenAPI Generator 7.25.0 reproduced the formatted committed client.                                                                                                                                                                                                     |
| Public SSR runtime and curl checks                             | PASS - `/` returned 200 with `X-Robots-Tag`; unknown route returned 404; rendered HTML had demo banner and no staff-shell text.                                                                                                                                                |
| `docker compose config --quiet`                                | PASS.                                                                                                                                                                                                                                                                          |
| `docker compose up -d postgres`                                | PASS - PostgreSQL 17.11 healthy on localhost:15432 with bounded resources and named volume.                                                                                                                                                                                    |
| demo seed executed twice                                       | PASS - first inserted 3 settings/10 service codes; second inserted zero.                                                                                                                                                                                                       |
| `backend/mvnw.cmd verify` with Docker                          | PASS - eight backend tests, zero failures/skips, including PostgreSQL Testcontainers and architecture checks.                                                                                                                                                                  |
| migration replay/runtime DDL restriction                       | PASS - second migration applied zero; runtime SELECT succeeded; CREATE/DROP raised SQL exceptions.                                                                                                                                                                             |
| worker `local,worker` profile                                  | PASS - application started, remained active for polling and owned no listening TCP port; stopped manually after verification.                                                                                                                                                  |
| host API `local` profile                                       | BLOCKED - migration succeeded, but this Windows JDK installation failed while Tomcat created its internal selector pipe (`SocketException: Invalid argument: connect`). MockMvc verifies the HTTP/security behavior; the executable API start remains unverified on this host. |
| secret scan action                                             | NOT RUN locally - pinned gitleaks CI job is configured; no CI run exists yet.                                                                                                                                                                                                  |

## Acceptance status

| Acceptance criterion                                                                   | Status  | Evidence/limitation                                                                                                                                                                    |
| -------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pinned install, PostgreSQL, migrations, both apps/backend build and checks             | BLOCKED | Install, database, migrations, builds and tests pass. Host API socket startup is blocked by the local JDK/Windows selector failure.                                                    |
| Migrations twice; runtime cannot mutate schema; reset refuses production               | PASS    | Testcontainers and guarded script behavior verified.                                                                                                                                   |
| Public bundle excludes staff/provider/AWS secrets; private endpoint rejects anonymous  | PASS    | Separate bundles, content scan and MockMvc 401 test.                                                                                                                                   |
| Architecture rule catches forbidden dependency; drift detectable; worker no public API | PASS    | Explicit failing fixture, regeneration check and live worker port inspection.                                                                                                          |
| Synthetic settings, hostile correlation handling and minimal health                    | PASS    | Reserved domains/blank phone, filter tests and minimal DTO.                                                                                                                            |
| Clean-checkout reproduction                                                            | NOT RUN | Current repository began with all source files untracked, so a committed clean checkout did not exist to test. Commands and lockfiles are documented for the first committed checkout. |

Overall phase status: **BLOCKED**, because the required host API startup check did not complete even though compilation, security tests, database integration, worker runtime and public SSR runtime passed.

## Pending provider or business checks

- No real identity, S3, SES, scanning, payment or telemetry provider was contacted. Production adapters and credentials remain pending their mapped phases.
- Real trading name, geography, contacts, service policies, imagery, credentials, claims and operators remain intentionally unconfirmed.
- Branch protection/environment approval availability must be checked against the selected private GitHub plan.
- Run the API on a second Java 21 host or repair the current Windows JDK networking/loopback configuration, then verify public health and anonymous private 401 over a real socket.
- Execute the pinned gitleaks workflow after the first branch/pull request exists.

## Next-phase handoff

Do not begin phase 02 until the API socket-start blocker above is cleared and the first committed clean-checkout workflow is rerun. Then phase 02 can add federated staff identity/session governance on top of the existing deny-by-default boundary. Use `feature/phase-01-foundation` from `develop` for developer-managed review; no branch was created automatically.

## Suggested commit message not executed

`feat: establish monorepo and development foundation`

## Git status

No staging, commit, push, merge, tag or pull request was performed. All changes remain uncommitted on the existing `main` branch.
