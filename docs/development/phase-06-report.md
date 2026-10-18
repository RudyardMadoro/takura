# Phase 06 report — Secure S3 uploads, scanning and media publication

Date: 2026-10-18  
Overall status: **PASS** (implementation, automated backend/frontend checks and the complete local browser lifecycle pass; opt-in real AWS evidence remains NOT RUN because credentials were not supplied)

## Scope and source mapping

Implemented against Requirements v1.2, Specification v1.1, Architecture v1.0 and the Phase 01–05 reports. The source DOCX paragraphs and tables and their checked-in extracts were reviewed. Work maps to FR 04–05, 13–15, 22; NFR 01–02, 10; SP 09–10, 19–20, 24, 34–35; AR 06, 08, 17; T03, T09–10, T18; AAT 05. No checkout, automatic cutting/manufacturing, customer accounts, public originals or Phase 08 quote-PDF behavior was added.

## Files changed

- Public upload flow and proxy: `apps/public-web/src/app/catalogue-api.service.ts`, `quote.page.ts`, `server.ts`.
- A08 staff media flow: `apps/staff-web/src/app/media-library.page.ts`, `app.routes.ts`, `staff.pages.ts`.
- Upload, validation, scanning, media, storage and maintenance implementation: `backend/src/main/java/com/example/takura/media/`.
- Enquiry, security, errors and worker integration: `EnquiryService.java`, `SecurityConfiguration.java`, `DomainErrorHandler.java`, `WorkerConfiguration.java`.
- Persistence and configuration: `V7__secure_uploads_and_media.sql`, `application.yaml`, `compose.yaml`, `infra/local/init-storage.sh`.
- AWS deployment examples: `infra/aws/storage/`.
- Versioned contract/client: `contracts/openapi.yaml`, `libs/api-client/src/generated/`.
- Tests: `AttachmentValidatorTest`, `ClamAvScannerIntegrationTest`, `S3ObjectStorageIntegrationTest`, and the migration expectation.
- Browser regression: `tests/e2e/phase-06-secure-upload.spec.ts`, the Phase 05 attachment-boundary assertion and the end-to-end runbook.

## Architecture decisions and source mappings

- Anonymous upload sessions use a 256-bit random capability and persist only its SHA-256 hash. Sessions expire after 60 minutes. Allocation uses PostgreSQL advisory transaction locks and rechecks per-risk and global capacity inside the transaction so concurrent sessions cannot bypass limits.
- Customer sessions permit five JPEG/PNG/WebP/PDF/non-macro-XLSX files, 10 MiB each and 50 MiB combined. Staff media permits the same image/document types plus configured reviewed MP4, bounded to 100 MiB and two minutes. Browser MIME remains advisory.
- Presigned POST policies expire after five minutes and bind one generated quarantine key, exact content type, exact byte size, checksum, attachment metadata and server-side encryption. Renewal rechecks quota. Browsers receive no AWS credential, list permission or download capability.
- Completion verifies the assigned key, object version, size, checksum, type and attachment metadata. It copies that exact version to a write-protected private key and validates/scans only the pinned bytes. Reusing the staging POST cannot mutate the CLEAN/private version. Completion is idempotent once validation has started.
- Structural checks decode images, bound PDF pages, reject macro/ActiveX/executable XLSX content and decompression/entry-count excess, and perform bounded MP4 `ftyp`/duration probing. SVG, CAD, archives, executables and customer video are rejected. No formula or active content is executed.
- ClamAV uses TCP INSTREAM outside database transactions. It verifies signature timestamp freshness (seven-day maximum), fails closed on stale/unknown/outage results and uses durable `FOR UPDATE SKIP LOCKED` jobs with bounded leases and expired-lease recovery.
- Enquiry association is part of the enquiry transaction. Every attachment is rechecked against the supplied capability and purpose before an atomic unassociated-row update. Pending/CLEAN files may associate; rejected, expired, foreign or already-associated files may not. Full sheets still require no file; BOARD_CUTTING ATTACHMENT does.
- Public upload UI calculates SHA-256 locally, shows progress, supports abort/retry, preserves form state through pending/errors and submits only attachment IDs plus the in-memory capability. Anonymous capabilities cannot download.
- Staff downloads require valid staff JWT/session, lead operation plus record/team scope, CLEAN state and a five-minute signed URL. Download audit records contain identifiers/actions, not raw filenames, keys or URLs.
- A08 staff upload uses the protected upload-session flow. Images require rights, stage, caption, informative alt text and explicit clearance; decode/re-encode removes metadata before a responsive approved-public derivative is written. Private plans cannot be promoted through this path.
- Reviewed MP4 is disabled by default and requires the explicit configuration flag, a cleared poster image, captions reference, rights metadata and publication clearance. The original remains private and only the reviewed derivative enters the public boundary; no customer-video path exists.
- Abandoned, unassociated objects become eligible after 30 days. The maintenance worker claims work with `SKIP LOCKED`, deletes exact versions outside the transaction, records retry/completion without raw keys and periodically reconciles CLEAN database references to private objects.
- Production startup rejects local endpoints/static local credentials, reused boundary buckets and local bucket names. Quarantine, private-clean, public-derivative and backup boundaries stay separate; CloudFront OAC examples grant read only to approved derivatives.

## Migration and configuration

- `V7__secure_uploads_and_media.sql` adds upload sessions, attachment state/version/checksum data, enquiry associations, scan jobs/leases, media derivative metadata and storage audit records. It extends media assets with rights, stage and source controls.
- Local S3-compatible testing uses `localstack/localstack:4.14.0` with signature validation, versioning, Block Public Access and exact localhost origins. The initializer creates four distinct buckets and applies CORS without making objects public.
- ClamAV uses `clamav/clamav:1.4.3`. The controlled scanner can activate only with the explicit `test-controlled-scan` profile.
- AWS SDK for Java is pinned at 2.56.0; PDFBox 3.0.6 and TwelveMonkeys 3.12.0 provide bounded parsing/decoding.
- `REVIEWED_STAFF_VIDEO_ENABLED` defaults to false. Production requires explicit non-local bucket, endpoint and credential configuration.

## Commands and actual outcomes

| Check                                             | Status  | Actual outcome                                                                                                                                                                                                     |
| ------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `git status --short`; `git branch --show-current` | PASS    | Work continued on `main` and remains uncommitted. Recommended developer branch: `feature/phase-06-secure-media` from `develop`.                                                                                    |
| Official compatibility review                     | PASS    | Existing pinned Angular/Spring/Java combinations and AWS SDK were retained; LocalStack 4.14.0 and its S3 version/signature controls were checked against official documentation.                                   |
| `docker compose config --quiet`                   | PASS    | Compose configuration validated. Local PostgreSQL, LocalStack and ClamAV became healthy; the storage initializer completed.                                                                                        |
| `backend\\mvnw.cmd verify`                        | PASS    | 23 tests passed, none failed or skipped. PostgreSQL 17.11 applied/revalidated all seven migrations; real local S3 and real ClamAV tests executed.                                                                  |
| Local S3 version-pinning integration              | PASS    | A real presigned multipart POST was accepted, the exact version was pinned private, the staging key was overwritten, and the pinned read still returned the original bytes.                                        |
| Real ClamAV integration                           | PASS    | A safe fixture returned CLEAN and the standard EICAR test fixture returned REJECTED; scanner signature freshness was validated and no real malware was used.                                                       |
| Structural validation fixtures                    | PASS    | Genuine PNG/PDF and bounded MP4 passed; disguised PDF, SVG, macro-bearing XLSX and over-duration MP4 failed.                                                                                                       |
| `pnpm api:generate`                               | PASS    | Client regenerated deterministically with public/staff upload and A08 endpoints.                                                                                                                                   |
| `pnpm build`                                      | PASS    | Public SSR, staff CSR and all libraries built. The host Node 23.5 warning remains because it is not the pinned Node 24.19 runtime.                                                                                 |
| `pnpm test`                                       | PASS    | Six frontend targets passed (8 tests).                                                                                                                                                                             |
| `pnpm format:check`                               | PASS    | All Prettier-managed files passed after final generation and UI changes.                                                                                                                                           |
| `pnpm test:e2e:phase06`                           | PASS    | Four stable-Chrome tests passed: real presigned upload and committed enquiry, mobile axe/overflow and scoped download denial, late controlled rejection with one replacement event, and cancel/retry preservation. |
| `pnpm test:e2e:phase05`                           | PASS    | Six Phase 04–05 browser regressions passed after updating the Phase 05 boundary assertion: ATTACHMENT is now enabled by Phase 06 while NEED_HELP remains the default.                                              |
| Real AWS S3/CORS/OAC/IAM                          | NOT RUN | No opt-in isolated AWS credentials were available; no account or infrastructure was provisioned or mutated.                                                                                                        |

## Acceptance status

- **PASS:** Allowed and forbidden structural fixtures, real ClamAV clean/reject behavior and fail-closed scanner handling are implemented and automated.
- **PASS:** Exact S3 version pinning survives a staging-key overwrite; presigned POST fields constrain generated key, size, type, checksum and metadata.
- **PASS:** Foreign session/capability, expiry, checksum/version/metadata and concurrent association checks deny attachment misuse; anonymous capabilities cannot download.
- **PASS:** SCAN_PENDING enquiry association is durable. The browser journey verified subsequent CLEAN completion, plus late controlled rejection that retained the enquiry and created exactly one replacement event.
- **PASS (implementation):** Full-sheet enquiries require no upload. BOARD_CUTTING supports ATTACHMENT or NEED_HELP; rejected attachments cannot satisfy or associate.
- **PASS:** Anonymous access returned 401, Content Editor without lead scope returned 403, and out-of-scope Reviewer returned 404 for a real CLEAN attachment. The approved-public boundary accepts only explicitly cleared derivatives.
- **PASS (implementation):** Staff image upload/publication, opt-in reviewed MP4 controls, 30-day abandoned cleanup, expired scan-lease recovery and reconciliation are present.
- **PASS:** The stable-Chrome lifecycle covered upload progress/completion, committed enquiry association, pending-to-CLEAN processing, late REJECTED replacement handling, copied-ID denial, cancel/retry, data preservation, mobile overflow and WCAG A/AA axe checks.
- **NOT RUN:** Real AWS CORS, Block Public Access, encryption, versioning, OAC and least-privilege IAM behavior in an isolated account. The prompt permits this to remain provider-readiness evidence, not a local validation bypass.

## Limitations and next-phase handoff

Phase 06 is ready for review and the Phase 07 handoff. The real-AWS harness must remain explicit and opt-in; keep it recorded as NOT RUN until credentials are deliberately supplied. Reuse the capability/hash contract, immutable object-version fields, attachment states, scan lease worker, cleanup/reconciliation audit, media clearance gate and staff scope helper. Customer quote PDFs remain API-proxied Phase 08 work.

No changes were committed or pushed.
