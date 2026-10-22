# UI-08 — Customer Enquiry & Quotation UX

Date: 2026-10-22  
Status: **PASS**

## Outcome

The public quotation request now presents a clearer premium project-brief experience while preserving the established four-step enquiry contract. All launch service combinations, anonymous submission, idempotency, routing, ownership, secure upload and scanning semantics remain unchanged.

No automatic quote/PDF generation, payment, checkout, order, reservation or fabrication workflow was introduced.

## Audit and design decisions

- Public entry points converge on `/request-quote` with an optional immutable service-code query parameter; board details may also supply a published variant ID.
- Added a visible context panel that names the originating service and explains that other services can be combined into one reference and owner.
- Reworked service selection as a responsive card grid without changing checkbox names, values or service codes.
- Added clear step introductions and programmatic heading focus when moving forward or backward through the wizard.
- Added visible required indicators while preserving concise accessible labels used by assistive technology and existing browser automation.
- Added client-side shared contact checks before review. The server remains authoritative and its field errors continue to populate the focusable error summary.
- Improved the review screen with structured service/request/description sections and a distinct privacy/marketing panel.
- Improved the committed success state with the friendly reference, next-step guidance and a homepage action.
- Preserved entered values after recoverable submission errors. The same idempotency key and body continue to be reused unless the visitor deliberately changes the request.
- Retained UI-07 upload limits, capability ownership, checksum/version completion, pending-scan messaging, private association, cancel/retry and `NEED_HELP` fallback.

## Files changed

- `apps/public-web/src/app/quote.page.ts`
- `apps/public-web/src/styles.scss`
- `tests/e2e/ui-08-enquiry-ux.spec.ts`
- `tools/capture-ui-08.mjs`
- `docs/development/screenshots/ui-08-desktop-enquiry.jpg`
- `docs/development/screenshots/ui-08-mobile-contact.jpg`
- `docs/development/UI-08-REPORT.md`

## Verification

| Check                                 | Status | Actual outcome                                                                                                                                                                                                                        |
| ------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm build:public`                   | PASS   | Angular SSR build completed with 14 prerendered routes. Initial browser bundle remained within the 500 kB raw budget at 499.99 kB; estimated transfer was 126.38 kB. The host Node 23.5 non-LTS warning remains environmental.        |
| UI-08 plus Phase 04–05 Playwright run | PASS   | 8/8 tests passed: contextual entry, required validation, heading focus, narrow layout, full-sheet submission, mixed-service submission, 200% zoom, automated WCAG A/AA scan, removal confirmation and recoverable-error preservation. |
| Secure-upload browser regression      | PASS   | 3/3 selected UI/security journeys passed: upload with enquiry association, private staff-scope enforcement, and cancel/retry with preserved contact data.                                                                             |
| `pnpm test`                           | PASS   | Six frontend targets passed; 9 tests total.                                                                                                                                                                                           |
| `pnpm format:check`                   | PASS   | All Prettier-managed files passed.                                                                                                                                                                                                    |
| `git diff --check`                    | PASS   | No whitespace errors.                                                                                                                                                                                                                 |
| Screenshot capture                    | PASS   | Desktop service-selection and 375 px contact views captured from the current SSR bundle.                                                                                                                                              |

The Phase 06 late-scanner-rejection worker test was excluded from this UI-focused rerun because the local database retains deferred `SCANNER_UNAVAILABLE` jobs from the prior session. The UI does not bypass or reinterpret `SCAN_PENDING`; the three attachment journeys affected by UI-08 passed unchanged.

## Screenshots

- `docs/development/screenshots/ui-08-desktop-enquiry.jpg`
- `docs/development/screenshots/ui-08-mobile-contact.jpg`

## Compatibility and security

- No backend, API schema or generated-client change was required.
- Server validation, transaction boundaries, idempotency and singular ownership remain authoritative.
- Raw file names are not added to page status text or logs.
- Attachments remain private during validation and scanning.
- Marketing remains optional and false by default.
- Successful submission is displayed only after the API returns the committed reference.

## Suggested commit

`feat(public): modernize customer enquiry and quotation forms`

No commit or push was performed.
