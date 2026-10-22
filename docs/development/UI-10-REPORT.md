# UI-10 — Public Website Modernization Acceptance & Sign-off

Date: 2026-10-22  
Overall local acceptance status: **PASS**  
Production deployment qualification: **NOT IN SCOPE**

## Executive summary

The UI-01 through UI-09 modernization is accepted for local development. The public website presents one cohesive architectural design system across the home, navigation, service, project, cabinetry, catalogue and enquiry experiences. All executable local acceptance gates passed after the test runtime was aligned with its intended profiles. No critical or high-severity regression remains open.

This sign-off does not supersede the external account, provider, legal-content and real-host blockers in the Phase 10 report, and it does not claim that the application is production-ready or deployed.

## Evidence reviewed

- `UI-01-REPORT.md` through `UI-09-REPORT.md`.
- `phase-10-report.md` and its local release evidence as a baseline.
- Public Angular SSR implementation, route definitions, shared layout, page templates, global styles and Playwright coverage.
- Spring Boot public APIs, catalogue/enquiry/media integrations, OpenAPI contract, generated client, Flyway migrations and backend verification suite.

The UI reports consistently record the charcoal/off-white/timber token system, editorial typography, shared container/button/focus primitives, global header/footer, responsive content patterns, repository-owned synthetic imagery and truthful content boundaries. No UI phase introduced unsupported commerce, customer accounts, inventory, automated manufacture, testimonials or completed-project claims.

## Accepted public experience

| Area                                 | Status                        | Evidence                                                                                                                                                     |
| ------------------------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Global header, footer and navigation | PASS                          | Desktop/mobile navigation, active states, Escape/focus return, configured placeholder contact treatment and SSR output verified.                             |
| Homepage                             | PASS                          | Premium hero, primary business routes, published synthetic concepts, cabinetry/board positioning and working quotation CTAs verified.                        |
| Services                             | PASS                          | Index and construction/detail routes render with consistent page headers, truthful scope, related navigation and enquiry links.                              |
| Project portfolio                    | PASS                          | Published-only listing/detail content, responsive gallery, keyboard dialog, synthetic ownership labels and enquiry links verified.                           |
| Cabinetry                            | PASS                          | Supply-only/fix-and-supply explanation, responsive showcase, gallery controls and contextual enquiry route verified.                                         |
| Board supply/hardware                | PASS                          | Published catalogue, specification cards/detail, full-sheet path, filters and no-commerce boundary verified.                                                 |
| Enquiry wizard                       | PASS                          | Contextual services, nested payload workflow, validation summary, input preservation, phone/mixed/full-sheet/cutting paths and accessible feedback verified. |
| Secure attachments                   | PASS                          | S3-compatible local upload, private association, pending submission, controlled late rejection, retry/cancel and scope denial verified.                      |
| SSR/SEO                              | PASS                          | Representative routes returned 200 with route-specific titles; canonical/noindex/reduced-motion and genuine dynamic 404 coverage passed.                     |
| Responsive/accessibility             | PASS (automated and keyboard) | 320/375/768/1024/1440 widths, 200% zoom, axe WCAG A/AA rules, focus behavior, mobile navigation, FAQ and gallery checks passed.                              |

## Commands and actual outcomes

| Check                                                                | Status  | Actual outcome                                                                                                                                                                                                                     |
| -------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm format:check`                                                  | PASS    | All Prettier-managed files matched.                                                                                                                                                                                                |
| `pnpm typecheck`                                                     | PASS    | Root TypeScript check completed without diagnostics.                                                                                                                                                                               |
| `pnpm test`                                                          | PASS    | Six Angular test targets passed; 9 tests total.                                                                                                                                                                                    |
| `pnpm build`                                                         | PASS    | Public SSR, staff CSR and all shared libraries built; 14 public routes prerendered. Public initial browser bundle: 500.85 kB raw / 126.60 kB estimated transfer.                                                                   |
| `pnpm exec openapi-generator-cli validate -i contracts/openapi.yaml` | PASS    | Contract valid; two non-failing recommendations for unused `Location` and `Money` schemas.                                                                                                                                         |
| `backend\\mvnw.cmd -f backend\\pom.xml verify` with Java 21          | PASS    | 40 tests passed, including architecture, security, PostgreSQL/Testcontainers, all migrations, S3-compatible storage and genuine ClamAV fixtures.                                                                                   |
| `pnpm test:e2e:r1`                                                   | PASS    | 35 Playwright tests passed in 37.2 seconds using stable Chrome and eight workers.                                                                                                                                                  |
| Raw SSR route sampling                                               | PASS    | `/`, `/services`, `/services/construction`, `/projects`, `/cabinetry`, `/boards`, `/hardware` and `/request-quote` returned 200 with SSR titles/noindex policy.                                                                    |
| Dependency/migration diff                                            | PASS    | No UI-10 changes to `package.json`, `pnpm-lock.yaml`, `backend/pom.xml` or Flyway migrations. Existing schema validated at version 10; the runtime reports 11 migration resources because the repeatable migration is included.    |
| Deterministic generated-client drift command                         | NOT RUN | `pnpm api:check` was not run because `libs/api-client/src/generated/model/staffSession.ts` contained a pre-existing developer formatting change. Contract validation and client-library compilation passed without overwriting it. |
| Physical screen-reader announcement review                           | BLOCKED | No supported screen reader was available in this environment. Automated semantics, axe checks and keyboard behavior passed; NVDA/VoiceOver confirmation remains a manual follow-up.                                                |

### Runtime note

The first backend verification attempt found ClamAV still serving its pre-update signature set even though the container health check had passed. Restarting the already-running local container loaded signature version 28161, after which the genuine safe/EICAR integration and the complete 40-test backend suite passed.

The late-rejection browser fixture requires the explicit `test-controlled-scan` worker and must submit while the attachment is still pending. The final full-suite run started that worker after the browser suite began; all 35 tests then passed. This is acceptance-test orchestration only and does not weaken production fail-closed scanning.

The host used Node 23.5.0 rather than the repository-pinned Node 24.19. Angular warned that the odd-numbered host release is not LTS, but every frontend gate passed. Re-run in the pinned runtime for release-candidate evidence.

## Final screenshots

Captured from the built SSR application at `127.0.0.1:4000` with animations disabled:

- `docs/development/evidence/ui-10/desktop-home.png` — 1440 px homepage.
- `docs/development/evidence/ui-10/desktop-services.png` — 1440 px services index.
- `docs/development/evidence/ui-10/mobile-projects.png` — 375 px project portfolio.
- `docs/development/evidence/ui-10/mobile-enquiry.png` — 375 px board-cutting enquiry entry.

Visual review confirms consistent typography, spacing, section rhythm, image treatment, controls and footer composition with no visible horizontal overflow. Demo/synthetic labelling remains prominent.

## Dependencies, migrations and backend compatibility

- UI-10 added no runtime dependency, database migration or backend contract change.
- UI-01 through UI-09 remain compatible with Angular SSR/hydration and the current public APIs.
- Public catalogue and content continue to use publication/clearance rules; enquiry and upload security stay server-authoritative.
- Generated API client compiles as part of `pnpm build`.
- Backend verification reapplied and validated migrations against isolated PostgreSQL 17.11 containers.

## Remaining issue register

| ID      | Severity      | Status   | Issue and next action                                                                                                                                                       |
| ------- | ------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI10-01 | Low           | OPEN     | Run an NVDA or VoiceOver pass for menu, FAQ, gallery, catalogue selection, form error summary and success state; record spoken order and announcements.                     |
| UI10-02 | Low           | OPEN     | Repeat the frontend matrix with pinned Node 24.19 for release-candidate evidence. Current Node 23.5 emitted a support warning only.                                         |
| UI10-03 | Low           | OPEN     | Resolve or deliberately retain the pre-existing `staffSession.ts` formatting delta, then run `pnpm api:check` on a clean generated-client tree.                             |
| UI10-04 | Low           | OPEN     | Make the controlled late-rejection worker timing a first-class test harness fixture so `pnpm test:e2e:r1` does not depend on external delayed startup orchestration.        |
| UI10-05 | Informational | DEFERRED | Replace synthetic/demo imagery, copy, canonical host and pending contact values only after rights and business approval. This is launch readiness, not a UI coding failure. |
| UI10-06 | Informational | DEFERRED | Phase 10 external Contabo, AWS, Cognito/MFA, SES, DNS, legal/policy and real-provider checks remain outside local UI acceptance.                                            |

No open item is critical or high severity.

## Final implementation summary

UI-01 through UI-09 now form a consistent public experience: reusable design foundations; responsive global navigation; premium homepage; service, project and cabinetry presentation; catalogue and cutting UX; accessible enquiry forms; and final responsive/SEO polish. UI-10 added acceptance evidence and this report only; it did not change application behavior.

No changes were committed, pushed, merged, tagged or deployed by this acceptance task.

Suggested conventional commit message (not executed):

`test(public): complete UI modernization regression and acceptance`
