# UI-04 — Modernize Construction & Service Pages

Date: 2026-10-22  
Status: PASS

## Outcome

The public services index and service details now use the UI-01–UI-03 architectural design language: editorial scale, charcoal/off-white/timber tones, generous spacing, abstract material studies, responsive scope panels, related-service navigation and direct enquiry actions. Existing published service records remain API-driven. Construction, renovations, extensions, conversions and maintenance use tightly scoped frontend overview routes until matching editorial records are published.

No completed-project claim, testimonial, statistic, credential, price, availability promise or approval outcome was introduced. All new visual studies are CSS-generated and labelled synthetic.

## Existing routes and offering review

- Existing editorial routes retained: `/services`, `/services/property-transformation`, `/services/custom-cabinetry`, `/services/standalone-board-supply`.
- New truthful offering overviews: `/services/construction`, `/services/renovations`, `/services/extensions`, `/services/conversions`, `/services/maintenance`.
- Existing standalone property, cabinetry, boards, hardware and quotation routes remain available.
- The dynamic `/services/:slug` resolver and published content endpoint remain the authority for editorial entries. Static overviews deliberately precede the parameter route and do not create database records or pretend to be published portfolio content.

## Implementation

- Added explicit service overview routes and matching SSR prerender declarations.
- Rebuilt the service index as a responsive editorial grid with every relevant offering discoverable.
- Added reusable service-detail composition for both API-published and route-backed services.
- Added service-specific enquiry query parameters, briefing frameworks and related-service navigation.
- Added synthetic abstract visual studies in CSS, avoiding unlicensed or misleading completed-work imagery.
- Updated SSR status handling so static service overviews are not preflighted as missing CMS content.
- Scoped sticky navigation styling to `.site-header`; semantic service `<header>` elements remain in normal document flow and cannot cover the navigation or following content.
- Corrected the service full-bleed inset token from the undefined `--container-wide` to the established `--content-wide`, restoring aligned left/right padding for hero copy and scope content.
- Extended the Phase 03 browser regression set with every service overview route, enquiry-link verification and an automated WCAG A/AA scan.

## Accessibility and responsive evidence

- Service detail axe scan: PASS after correcting accent contrast on charcoal sections.
- Keyboard-visible links and existing global focus treatment are retained.
- New routes are included in the 320 CSS-pixel route matrix; no horizontal overflow was detected.
- Existing 320/375/768/1024/1440 homepage reflow checks and 200% zoom check remain passing.
- Headings, landmarks, labelled synthetic visuals and related-services navigation have explicit semantics.

## Screenshots

- `docs/development/screenshots/ui-04-desktop-services.jpg`
- `docs/development/screenshots/ui-04-desktop-construction.jpg`
- `docs/development/screenshots/ui-04-mobile-renovations.jpg`

## Files changed

- `apps/public-web/src/app/app.routes.ts`
- `apps/public-web/src/app/app.routes.server.ts`
- `apps/public-web/src/app/public.page.ts`
- `apps/public-web/src/server.ts`
- `apps/public-web/src/styles.scss`
- `tests/e2e/phase-03-public.spec.ts`
- `tools/capture-ui-04.mjs`
- Screenshot evidence listed above
- This report

## Verification

| Check                               | Result | Actual outcome                                                                                                              |
| ----------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------- |
| `pnpm build:public`                 | PASS   | Angular browser/server bundles built; 14 static routes prerendered.                                                         |
| `pnpm test -- --project public-web` | PASS   | 3/3 public-web unit tests passed.                                                                                           |
| `pnpm test:e2e:phase03`             | PASS   | 13/13 Chrome journeys passed, including service routes, responsive widths, zoom, keyboard semantics, gallery and axe scans. |
| `pnpm format:check`                 | PASS   | Prettier-managed files passed.                                                                                              |
| `git diff --check`                  | PASS   | No whitespace errors.                                                                                                       |

The host used Node 23.5.0 and emitted the known odd-numbered, non-LTS warning; the repository remains pinned to Node 24.19 for supported execution.

## Gaps and follow-up

- Construction, renovations, extensions, conversions and maintenance do not yet have dedicated published CMS records. Their overview copy is intentionally narrow; future editorial records can replace it through the existing publication workflow.
- Verified completed-work galleries were not available. The design uses clearly labelled synthetic studies rather than implying project evidence.
- No backend schema or API extension was necessary.

## Git status

No commit or push was performed.

Suggested commit: `feat(public): enhance construction and renovation service pages`
