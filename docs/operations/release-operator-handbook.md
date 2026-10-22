# R1 release operator handbook

## Gates and ownership

Release from a clean protected `main`/signed tag only. The private GitHub plan and environment reviewer
support remain an external check; if unavailable, two named operators must record manifest hash,
approval and deployment transcript outside GitHub. Pull requests have read-only permissions and no
production credentials. CI never commits generated output. Recommended branches are `feature/*` from
`develop`, `release/*` to `main` and `develop`, and `hotfix/*` from `main` merged back to both.

## Candidate and promotion

1. Run all CI gates and archive Playwright traces, test reports, SBOMs, scanner results and the manifest.
2. Sign images and replace local candidate identities with registry `@sha256` digests without rebuilding.
3. Verify the candidate tree equals the protected merge tree using `verify-manifest.ps1`.
4. Acquire the deployment concurrency lock and verify backup age, capacity and previous manifest.
5. Pull exactly the tested digests, run the one-shot migration, then start API/worker/SSR/assets.
6. Require readiness plus non-mutating smoke checks before switching host-proxy traffic.

Routine rollback restores the previous compatible application digest, never yesterday's database.
Migrations must be expand-and-contract. If the old application cannot run against the migrated schema,
stop before traffic. New enquiries stay in the current database. On a single VPS, use a short maintenance
window because duplicate full stacks may exceed capacity.

## Failure rehearsal

For staging, start the candidate with gateway traffic withheld, deliberately fail its readiness setting,
confirm the gateway still targets the previous stack, then restart the previous manifest against the
expanded schema. Submit a synthetic enquiry before failure and prove it remains afterward. Archive IDs,
timestamps, schema version and row counts without customer data. This rehearsal remains required on an
approved host; it was not executed merely by adding this runbook.

## Launch truthfulness

Preview may use labelled synthetic copy. Live launch requires confirmed domain/contact/service areas,
legal privacy/terms, identity provider and MFA, real operator roster, cleared media and claims, SES/DNS,
S3/CORS/OAC/IAM, alert routing, backups and incident ownership. A placeholder is a business-readiness
blocker, not evidence that a business fact is true.
