# UI-07 — Board Supply & Cut-to-Size UX Modernization

Date: 2026-10-22  
Status: **PASS with one local worker-runtime verification limitation**

## Outcome

The public board catalogue, board detail view, hardware presentation, and four-step quotation journey now use the premium architectural design language established in UI-01–UI-06. Existing catalogue, enquiry, upload-session, attachment-completion, and enquiry-submission contracts were retained without backend changes.

No inventory, prices, checkout, payment, basket, or fabrication automation was introduced.

## Implementation

- Redesigned `/boards` with a spacious editorial heading, URL-backed filter panel, responsive specification cards, explicit published/specification language, and useful empty/error states.
- Redesigned `/boards/{slug}` with an architectural material composition, clearer product summary, accessible variant controls, dimensions/unit/availability detail, and separate full-sheet and cut-to-size actions.
- Improved `/hardware` cards while preserving the distinction between supplied products and labour.
- Modernized `/request-quote` with a semantic four-step progress indicator, clearer hierarchy, responsive form surfaces, and stronger back/continue actions.
- Improved secure-file selection feedback with file count and aggregate size. Filenames are not echoed into the page, persistent storage, or logs.
- Retained the separate `ATTACHMENT` and `NEED_HELP` cutting paths and all existing server-side validation.
- Preserved upload capability ownership, checksum/version completion, scanning state, private attachment association, and staff-scope enforcement. No upload API or security rule was weakened.
- Removed two duplicate accessible-name ambiguities: decorative board art is hidden from the accessibility tree, and the footer enquiry region no longer competes with the cabinetry form control label.
- Added narrow-screen and 200%-zoom containment so the wizard does not create horizontal document overflow.

## Files changed

- `apps/public-web/src/app/catalogue.page.ts`
- `apps/public-web/src/app/quote.page.ts`
- `apps/public-web/src/app/app.html`
- `apps/public-web/src/styles.scss`
- `tools/capture-ui-07.mjs`
- `docs/development/screenshots/ui-07-desktop-boards.jpg`
- `docs/development/screenshots/ui-07-desktop-board-detail.jpg`
- `docs/development/screenshots/ui-07-mobile-cutting-request.jpg`
- `docs/development/UI-07-REPORT.md`

## Verification evidence

| Check                   | Result                                 | Actual outcome                                                                                                                                                                                                                                                                                                                                                       |
| ----------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm build:public`     | PASS                                   | Angular public SSR build completed; 14 static routes prerendered. Initial browser bundle: 493.44 kB raw / 125.19 kB estimated transfer. Host Node 23.5 emitted the existing non-LTS warning.                                                                                                                                                                         |
| `pnpm test`             | PASS                                   | Six frontend targets passed; 9 tests total.                                                                                                                                                                                                                                                                                                                          |
| `pnpm test:e2e:phase04` | PASS                                   | 2/2: published board/full-sheet journey and mobile WCAG A/AA scan.                                                                                                                                                                                                                                                                                                   |
| `pnpm test:e2e:phase05` | PASS                                   | 6/6: board regression plus mixed services, mobile/200% zoom, service removal confirmation, and transient-error preservation.                                                                                                                                                                                                                                         |
| `pnpm test:e2e:phase06` | PASS (3/4 relevant UI/security checks) | Upload/enquiry association, private download scope, and cancel/retry preservation passed against LocalStack. The asynchronous late-rejection check remained `SCAN_PENDING` because nine earlier jobs had already been deferred as scanner unavailable before the worker profile was started; this is a local queue/runtime limitation, not a UI/API contract change. |
| `pnpm format:check`     | PASS                                   | All Prettier-managed files matched formatting rules.                                                                                                                                                                                                                                                                                                                 |
| `git diff --check`      | PASS                                   | No whitespace errors.                                                                                                                                                                                                                                                                                                                                                |
| Screenshot capture      | PASS                                   | Desktop catalogue/detail and a 375 px cutting-request/upload view were captured from the SSR build.                                                                                                                                                                                                                                                                  |

Local browser integration required the repository's PostgreSQL, LocalStack S3, and ClamAV services. The public SSR build was restarted after compilation so tests exercised the current asset hashes rather than a stale server process.

## Security and compatibility review

- API DTOs, routes, idempotency behavior, and generated clients are unchanged.
- Upload limits remain five files, 10 MiB each, and 50 MiB combined.
- Anonymous upload capabilities still cannot download attachments.
- Files remain private and unusable while pending scanning; the UI does not manufacture a clean state.
- Board requests remain quotation enquiries, not orders or reservations.
- SSR and no-JavaScript catalogue rendering remain in place.

## Screenshots

- `docs/development/screenshots/ui-07-desktop-boards.jpg`
- `docs/development/screenshots/ui-07-desktop-board-detail.jpg`
- `docs/development/screenshots/ui-07-mobile-cutting-request.jpg`

## Remaining local verification note

For a clean 4/4 Phase 06 rerun, start the `local,worker` backend role and clear or allow the existing scanner-unavailable retry windows to elapse before executing the suite. The production-safe fail-closed behavior was preserved; no code workaround was added.

## Suggested commit

`feat(public): improve board supply and cutting enquiry UX`

No commit or push was performed.
