# Phase 10 report — Release qualification, Contabo deployment and AWS migration readiness

Date: 2026-10-22  
Overall status: **BLOCKED** (all executable local release gates pass; real-host/provider/account/legal readiness remains external and unverified)

## Scope and source mapping

Implemented Phase 10 against all three baseline documents and Phase 01–09 reports. The exhaustive
FR/NFR, SP 01–38, P01–P19, A01–A12, T01–T23 and AAT01–AAT12 disposition is in
`docs/development/r1-traceability.md`. AAT11 remains an isolated deferred R3 fixture. No checkout,
payments, native app, inventory, automatic quote/PDF generation or fabrication automation was added.

## Files changed

- Immutable images: `Dockerfile.public`, `Dockerfile.staff`, `Dockerfile.backend`, `.dockerignore`.
- Contabo: `compose.contabo.yaml`, gateway/staff nginx configuration, production environment example and expanded README.
- AWS: validated Terraform target and example inputs under `infra/aws/terraform/`, plus migration-readiness notes.
- CI/release: expanded PR gates, candidate workflow, digest/tree release manifest and smoke tooling.
- Recovery: encrypted off-host backup, isolated restore validation and recovery/migration runbook.
- Operations: release handbook, incident guide and setup/live-launch boundaries.
- Qualification: R1 traceability and 20-user k6 workload definition.

## Architecture and release decisions

- Runtime containers are immutable, non-root where supported, read-only with bounded tmpfs/resources,
  and have health checks/graceful shutdown. No Docker socket is mounted.
- Contabo publishes only a loopback gateway for a host TLS proxy. Database, scanner and management
  networks are private. Runtime credentials cannot migrate; a separate one-shot Flyway job does so.
- Nginx replaces forwarded headers, applies request limits/security headers and separates public SSR,
  `/admin` assets and `/api/v1`. Production disables fake identity/scanning and payments.
- Candidate manifests bind commit, Git tree, schema V10, pinned runtimes, required checks and immutable
  digests. Promotion verifies the exact tree and never rebuilds. Deployment uses a concurrency lock,
  backup-age gate, migration, readiness and smoke stop conditions.
- Rollback selects the known compatible previous image against the current expanded schema; it never
  restores an older database and therefore preserves post-deploy enquiries.
- AWS remains validation-only. Terraform defines private RDS/task subnets, encrypted/versioned private
  buckets, ECR, ECS task/execution roles and digest-only tasks. Account-owned ALB/CloudFront/OAC,
  Secrets Manager, NAT/endpoints, Cognito and SES must be completed and planned in approved staging.

## Commands and actual outcomes

| Check                            | Status                | Actual outcome                                                                                                                         |
| -------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Git status/branch                | PASS                  | Began clean on `main`; all Phase 10 changes remain uncommitted. Recommend `feature/phase-10-release-readiness` from `develop`.         |
| `pnpm format:check`              | PASS                  | All Prettier-managed files passed before final report; final check repeated below.                                                     |
| `pnpm test`                      | PASS                  | Six frontend targets, 8 tests. Host Node 23.5 warned; container builds used pinned Node 24.19.                                         |
| `pnpm typecheck`                 | PASS                  | TypeScript completed without errors.                                                                                                   |
| `pnpm build`                     | PASS                  | Public/staff/libraries built; initial estimated transfers were 110.01 KB public and 115.97 KB staff.                                   |
| `pnpm api:check`                 | PASS                  | Generated TypeScript client had no contract drift.                                                                                     |
| Maven verify                     | PASS                  | 40 tests, 0 failures/errors, 2 opt-in real-provider tests skipped; 10 migrations applied.                                              |
| Full Playwright R1               | PASS                  | 26/26 journeys passed against PostgreSQL, LocalStack, controlled scanner, API, worker, public SSR and staff CSR.                       |
| Image builds                     | PASS                  | API, public SSR and staff images built locally from pinned bases; no registry push or digest promotion occurred.                       |
| Contabo Compose config           | PASS                  | Digest-only private-network composition rendered successfully with synthetic validation inputs.                                        |
| Terraform fmt/init/validate      | PASS                  | Terraform 1.9.8 container reported `Success! The configuration is valid.` No plan/apply or AWS call occurred.                          |
| 20-user load test                | PASS (local metadata) | 9,190 uncached requests at 20 VUs; p95 16.03 ms, 0.02% failure. Representative writes/scans/exports remain external.                   |
| Encrypted restore                | PASS (local)          | Age round-trip SHA-256 matched; isolated PostgreSQL 17 restore matched key counts, constraints and migrations. RPO 18.1 s; RTO 8.45 s. |
| Failed candidate/rollback        | PASS (local)          | Broken candidate exited 1; previous application stayed UP on schema V10 and enquiry count remained 10.                                 |
| Accessibility release regression | PASS                  | Public/staff axe, keyboard/focus, narrow viewport and 200% zoom journeys passed; human assistive-technology sign-off remains external. |

## Acceptance and blockers

- **PASS:** reproducible builds, tests, contract drift, image packaging, private network topology,
  digest/tree manifest, Terraform local validation and explicit R2/R3 exclusion.
- **PASS:** full local browser/accessibility regression, local 20-user metadata load, encrypted database
  restore and compatible-schema failed-candidate exercises now have actual evidence.
- **BLOCKED:** representative write/scan/export load and off-host private-object restore still need an
  approved staging host; local evidence cannot establish Contabo/AWS geography or provider behavior.
- **BLOCKED:** Contabo firewall/TLS/SSH/host-key, GitHub plan protections, off-host alert receiver,
  Cognito/MFA, S3/OAC/CORS/IAM, SES/DNS and legal/business facts require owner/provider evidence.
- **NOT RUN:** real AWS plan/account staging and migration. No infrastructure was provisioned.

## Handoff

Follow `release-operator-handbook.md` and `recovery-and-migration.md`. Replace every example domain,
contact, policy, identity, media claim and operator placeholder before live publication. Run the k6,
Playwright, restore and failed-deploy exercises on approved staging, archive their evidence, then update
this report and traceability matrix accurately. The single Contabo VPS remains one failure domain.

No source changes were committed or pushed, no tag was created and no deployment was performed.
