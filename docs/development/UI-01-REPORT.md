# UI-01 report — Repository audit and premium design foundation

Date: 2026-10-22  
Status: **PASS**

## Outcome

Established a reusable premium architectural design foundation for the Angular public SSR
application. The direction takes high-level inspiration from Theratio's light/dark architectural
surfaces, editorial typography, thin rules, restrained warm accents and spacious portfolio layouts.
No Theratio code, images, icons, fonts or other licensed package assets were copied. No new package,
backend change or network font dependency was introduced.

## Repository audit

- **Architecture:** Angular 22 public SSR/hydration in `apps/public-web`, separate Angular staff CSR,
  generated TypeScript client, and Spring Boot `/api/v1` backend. Public dynamic service, project and
  catalogue routes resolve allowlisted public APIs. Quote submission and private quote viewing use
  dedicated API clients and keep their existing security behavior.
- **Public routes:** `/`, `/property-transformation`, `/services`, `/services/:slug`, `/projects`,
  `/projects/:slug`, `/cabinetry`, `/about`, `/contact`, `/faqs`, `/privacy`, `/terms`, `/boards`,
  `/boards/:slug`, `/workshop/board-cutting`, `/hardware`, `/request-quote`, `/quote/view`, and the
  wildcard not-found route.
- **Reusable UI:** application header/footer and disclosure navigation; `.page`, `.eyebrow`, `.lead`,
  `.cards`, `.card`, `.action`, filter/form, error, gallery/dialog, wizard-action and placeholder
  primitives. Content, catalogue, enquiry and customer-quote page components share the global
  foundation.
- **Existing strengths retained:** semantic headings and landmarks, skip link, visible focus,
  44-pixel minimum controls, reduced-motion support, gallery dialog focus behavior, responsive grid,
  reserved gallery dimensions, real SSR 404 behavior, canonical/SEO metadata, non-production
  noindex controls and private quote no-store/noindex behavior.
- **Initial gaps:** hard-coded colours dominated the public stylesheet; the token library contained
  only five colours; typography had no display/body hierarchy; spacing and content widths were not
  tokenized; buttons and cards lacked a consistent visual system; the design-token README was the
  generated Angular placeholder.

## Design decisions

- Expanded semantic CSS custom properties for ink, mineral surfaces, timber accents, borders,
  danger, focus and demo states. Contrast-sensitive foreground/background pairs remain explicit.
- Added local display/body stacks. The serif display face creates an editorial architectural tone;
  local fallbacks avoid licensing, privacy, performance and layout-shift risks.
- Added bounded fluid typography, a common spacing scale, reading/wide measures, elevation and
  transition tokens.
- Restyled shared navigation, cards, calls to action, filters, form controls, FAQs, gallery/dialog,
  footer and error states. Controls remain native and semantic; no behavior moved into CSS.
- Added reduced-motion and forced-colours fallbacks. Mobile grids use `min(100%, ...)` and all input
  primitives retain constrained widths to prevent horizontal overflow and preserve 200% reflow.
- Kept existing synthetic branding/copy and repository-owned abstract placeholders. A later content
  decision can replace them through the existing publication/media-clearance workflow.

## Files changed

- `libs/design-tokens/src/_tokens.scss`
- `libs/design-tokens/README.md`
- `apps/public-web/src/styles.scss`
- `docs/development/UI-01-REPORT.md`

## Checks and actual results

| Check                                           | Status | Result                                                                                                              |
| ----------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------- |
| `pnpm build:public`                             | PASS   | Angular browser/server bundles built; nine static routes prerendered. Initial browser transfer estimate: 111.05 kB. |
| `pnpm test -- --project public-web`             | PASS   | 1 test file, 2 tests passed.                                                                                        |
| `pnpm exec ng test design-tokens --watch=false` | PASS   | 1 test file, 1 test passed.                                                                                         |
| `pnpm exec ng build design-tokens`              | PASS   | Angular package compiled and emitted successfully.                                                                  |
| `pnpm format:check`                             | PASS   | All Prettier-managed files passed after implementation.                                                             |
| `git diff --check`                              | PASS   | No whitespace errors.                                                                                               |

The host is Node 23.5.0 and emitted the existing odd-numbered/non-LTS warning; the repository pins
Node 24.19.0. This did not fail the build.

## Remaining implementation gaps

- This task intentionally establishes the foundation rather than redesigning each page composition.
  Later UI tasks can add page-specific hero/project imagery and richer editorial layouts using the
  same primitives.
- Current project gallery visuals are safe CSS placeholders. Genuine photography still requires
  approved rights, scan, derivative and publication clearance through the existing media workflow.
- Human screen-reader and visual-regression review of the new aesthetic should accompany later
  page-level changes. Existing automated Phase 03 accessibility journeys remain the regression
  baseline when the complete local API fixture stack is running.

## Git state

No commit or push was performed. The two pre-existing prompt-document changes were preserved and
were not modified by this implementation.

Suggested commit: `feat(public): establish premium architectural design system`
