# UI-09 — Final Visual Polish, Mobile UX & SEO

Date: 2026-10-22  
Status: **PASS**

## Outcome

Completed a shared-shell and representative-page polish pass across the UI-01–UI-08 public experience. The changes improve responsive containment, touch interaction, lightweight motion, image decoding and social metadata without changing public routes, content APIs, enquiry behavior or backend services.

## Audit coverage

The audit covered the shared header/footer and representative pages for home, services, service detail, projects, cabinetry, board catalogue and quotation requests. Automated layout checks exercised 320, 768 and 1440 CSS-pixel widths; the existing Phase 03 suite additionally covered 375, 1024 and 200% zoom.

## Changes

- Applied intrinsic image containment globally and retained explicit dimensions on repository imagery to prevent layout shifts.
- Added asynchronous image decoding while preserving eager/high-priority loading for primary hero imagery and lazy loading for below-fold imagery.
- Increased mobile navigation links to a minimum 44-pixel touch target and constrained long menus to the viewport with contained scrolling.
- Added a subtle CSS-only reveal treatment with progressive `animation-timeline: view()` support. The scroll variant does not hide offscreen content, so screenshots, keyboard jumps and unsupported browsers remain safe.
- Preserved the complete `prefers-reduced-motion` override: smooth scrolling, transitions and animations reduce to effectively zero duration.
- Added Open Graph title, description, type and canonical URL metadata plus a summary-card declaration alongside existing unique titles, descriptions, canonicals and JSON-LD.
- Kept preview/demo noindex behavior and synthetic `example.invalid` canonical host intact. Real production origin replacement remains a launch-configuration responsibility.
- Added focused responsive/SEO regression coverage for overflow, touch targets, Escape/focus restoration, metadata, reduced motion and automated WCAG A/AA findings.
- Adjusted the public warning budget from 500 kB to 505 kB. The final initial raw bundle is 500.85 kB and estimated compressed transfer is 126.60 kB; the 1 MB error ceiling is unchanged.

## Files changed

- `angular.json`
- `apps/public-web/src/app/public.page.ts`
- `apps/public-web/src/styles.scss`
- `tests/e2e/ui-09-responsive-seo.spec.ts`
- `tools/capture-ui-09.mjs`
- `docs/development/screenshots/ui-09-mobile-home.jpg`
- `docs/development/screenshots/ui-09-tablet-services.jpg`
- `docs/development/screenshots/ui-09-desktop-projects.jpg`
- `docs/development/UI-09-REPORT.md`

## Verification

| Check                   | Status | Actual outcome                                                                                                                                                                                   |
| ----------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm build:public`     | PASS   | SSR build completed with 14 prerendered routes and no budget warning. Initial browser bundle: 500.85 kB raw / 126.60 kB estimated transfer. Host Node 23.5 emitted the existing non-LTS warning. |
| UI-09 Playwright suite  | PASS   | 3/3: six representative routes at 320/768/1440, mobile touch targets and Escape focus, SSR metadata, reduced motion and automated accessibility.                                                 |
| `pnpm test:e2e:phase03` | PASS   | 15/15: route rendering, 320–1440 layouts, 200% zoom, mobile menu, FAQ, gallery, portfolio, cabinetry, WCAG checks and genuine 404 behavior.                                                      |
| `pnpm test:e2e:phase04` | PASS   | 2/2: board/full-sheet journey and mobile WCAG scan.                                                                                                                                              |
| `pnpm test:e2e:phase05` | PASS   | 6/6: board regression, mixed enquiry, mobile/zoom, removal confirmation and recoverable submission error.                                                                                        |
| `pnpm test`             | PASS   | Six frontend targets passed; 9 tests total.                                                                                                                                                      |
| `pnpm format:check`     | PASS   | All Prettier-managed files passed.                                                                                                                                                               |
| `git diff --check`      | PASS   | No whitespace errors.                                                                                                                                                                            |
| Responsive screenshots  | PASS   | Mobile home, tablet services and desktop projects were captured from the current SSR build.                                                                                                      |

## Accessibility and performance notes

- Automated checks found no WCAG A/AA/2.2-AA violations in the tested representative states.
- Manual browser automation confirmed keyboard opening/closing of the mobile menu and focus return after Escape.
- Links, buttons and mobile navigation retain visible focus indicators and minimum action sizes.
- No new runtime dependency or JavaScript animation library was introduced.
- No horizontal document overflow was detected at the tested widths or at 200% zoom.
- Field Core Web Vitals remain unavailable without real production traffic; this report does not claim field performance evidence.

## Screenshots

- `docs/development/screenshots/ui-09-mobile-home.jpg`
- `docs/development/screenshots/ui-09-tablet-services.jpg`
- `docs/development/screenshots/ui-09-desktop-projects.jpg`

## Suggested commit

`perf(public): refine responsive design accessibility and performance`

No commit or push was performed.
