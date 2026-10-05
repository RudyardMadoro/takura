# Phase 06 — Secure S3 uploads, scanning and media publication

First iteration (R1) · Prompt pack version 1.0 · 5 October 2026

**Prerequisites:** Phases 01–05 complete; media metadata and outbox interfaces exist.

**Source traceability:** FR 04–05, 13–15, 22; NFR 01–02, 10; SP 09–10, 19–20, 24, 34–35; AR 06, 08, 17; T03, T09–10, T18; AAT 05.

Copy the entire “Codex implementation prompt” section below into Codex while the project repository is open. Attach the three baseline documents or place them under `docs/source/`. Execute one phase at a time and review its report before starting the next. This file is an implementation instruction, not an estimate or an assertion that code already exists.

## Codex implementation prompt — Phase 06: Secure S3 uploads, scanning and media publication

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

Write/update this phase's report at `docs/development/phase-06-report.md`, substituting the current phase number. Include files changed, architecture decisions and source mappings, migrations/configuration, commands run and actual outcomes, acceptance criteria status, limitations/provider checks still pending, and a short next-phase handoff. Use PASS/FAIL/BLOCKED/NOT RUN accurately. Then summarise this to me, list any remaining blockers, confirm that no changes were committed or pushed, and **suggest one conventional commit message without executing it**. Do not claim completion if a required check failed or was not run.

### Outcome

Deliver complete customer attachment enquiries and editorial asset handling, with immutable scanned bytes, private-by-default storage and approved public derivatives. A supplied cutting list never starts cutting automatically.

### Implementation tasks

1. Implement the storage abstraction using AWS SDK and S3-compatible local testing, with separate quarantine, write-protected scanning/private-clean, approved-public and backup boundaries per environment. Use versioned keys/object versions, encryption, Block Public Access, exact CORS origins and least-privilege IAM examples. CloudFront OAC may read only approved public derivatives. Never give a browser AWS credentials, listing permission or arbitrary-key access.
2. Implement anonymous POST upload-session and completion contracts. Issue cryptographically random scoped capabilities, store hashes, enforce 60-minute session expiry and quota, and issue restricted presigned POST credentials initially valid five minutes for one generated key/size/type. Renewal reruns quota checks. Customer types: JPEG, PNG, WebP, PDF and non-macro XLSX only; five files, 10 MiB/file, 50 MiB combined. Bound concurrent allocations so multiple uploads cannot bypass aggregate limits.
3. Completion verifies assigned key/object metadata, pins exact S3 version and checksum, and copies THAT version to a write-protected location. Validate and scan only the pinned immutable bytes. Overwriting the temporary upload key after completion must not change a CLEAN attachment. Completion is idempotent and rejects ownership, capability, checksum/version or expiry mismatches. Anonymous capabilities cannot download files.
4. Implement CREATED/UPLOADING/VALIDATING/SCAN_PENDING/CLEAN/REJECTED/FAILED/EXPIRED/DELETION_PENDING/DELETED transitions from SP 10, using durable worker jobs. Check signature/structure/extension, image decoding, PDF bounds and XLSX macro/decompression constraints; browser MIME is advisory. Reject executables, archives, macros, SVG and CAD. Run ClamAV plus bounded structural checks, with time/memory/temp-space limits, signature freshness and no unsafe formula execution. Production fails closed on scanner outage or unknown result.
5. Use local controlled scan adapters only in explicit test profiles. Add a real ClamAV integration test using safe standard test fixtures where available; do not insert real malware. Keep scanning out of database transactions and HTTP submission. Clean/private access remains denied while scan pending; late rejection keeps the enquiry and raises replacement work for staff.
6. Wire uploads into phase-05 Contact/files and cutting ATTACHMENT paths: progress/cancel/retry, expiry, pending state, readable errors and remove/NEED_HELP fallback. Associate session-owned nonrejected files transactionally with enquiry creation. A pending cut-list can be submitted but remains unreadable; already rejected files cannot satisfy required cutting input. No public lookup/download by reference or object key.
7. Build A08 media library and staff upload flow. Require media rights, stage, caption, informative alt text and clearance before publishing; strip EXIF/location data and create responsive safe derivatives with reserved dimensions. Reuse scan/version controls. Private plans can never be promoted without a new explicit clearance operation. Publishing a project validates every asset and invalidates public caches.
8. Add reviewed staff-only MP4 video handling behind configuration: demo limit 100 MiB/two minutes, poster, captions, no autoplay and bounded probing/processing. It is not a customer video upload feature. Reject video publication without required metadata/clearance. Keep originals private and publish only reviewed derivatives.
9. Protect staff downloads with record scope and CLEAN state; optional signed file links expire within five minutes. Customer quote PDFs will be API-proxied in phase 08 for immediate revocation. Add abandoned-file cleanup eligibility after 30 days, deduplicated jobs, object/reference reconciliation and audit without raw filenames/keys in operational logs. Full rights deletion/holds arrive in phase 09.

### Verification and acceptance

- Genuine allowed fixtures pass; disguised extensions, oversized files, macros, compressed bombs and forbidden formats fail. Scanner outage leaves inaccessible quarantine and alerts/metrics.
- Submit SCAN_PENDING file: enquiry is durable and staff cannot download; later CLEAN enables authorised access, later REJECTED retains enquiry and creates replacement task/event.
- Reuse upload POST after validation to overwrite staging bytes: CLEAN download remains the original pinned version. Wrong session cannot complete or attach another file.
- Full-sheet requests still require no upload. ATTACHMENT cut-to-size works with pending/clean file; rejected file forces removal or NEED_HELP.
- Anonymous visitor, Editor without lead scope and out-of-scope Reviewer cannot download private files. Public CDN serves only cleared derivatives, with metadata removed.
- Verify local emulator limits explicitly. Real S3/CORS/OAC/IAM tests use a documented opt-in isolated account harness; report NOT RUN if credentials are unavailable, never provision automatically.

### Handoff

Provide bucket/IAM/CORS templates, lifecycle diagram, scan/cleanup runbook, environment barriers and file-state fixtures. Record which AWS behaviours require real-service staging evidence.
