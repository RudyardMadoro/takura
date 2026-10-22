# UI-06 — Premium Cabinetry & Interior Showcase

Date: 2026-10-22  
Status: PASS

## Outcome

The public cabinetry route now presents the published custom-cabinetry service through the premium architectural language established in UI-01–UI-05. It combines a responsive concept hero, briefing categories, material-direction studies, an accessible detail gallery, scope guidance and direct cabinetry enquiry actions.

No ecommerce, cart, availability, price, completed-project claim or unverified material specification was introduced.

## Data and publication decisions

- `/cabinetry` resolves the existing published `custom-cabinetry` service from `GET /api/v1/services/custom-cabinetry`.
- A missing, archived or unavailable published record uses the existing not-found/unavailable state instead of silently rendering invented editorial content.
- Kitchen, wardrobe, vanity, TV-unit and custom-storage presentations are qualification categories supported by the existing cabinetry enquiry schema; they are not separate products or fabricated published records.
- Existing copy identifies SUPPLY_ONLY, FIX_AND_SUPPLY and UNDECIDED fulfilment routes.
- Dimensions are explicitly described as approximate and UNVERIFIED until reviewed.
- Plumbing, wiring, structural work, appliances and countertops remain explicit exclusions unless separately agreed.
- The repository-owned hero image and CSS studies remain labelled synthetic. Existing publication and media-clearance controls are unchanged.

## Implementation

- Added a dedicated cabinetry content resolver with stable error handling.
- Rebuilt the cabinetry hero and editorial introduction around API-published copy.
- Added five responsive briefing-category cards and functional cabinetry enquiry links.
- Added neutral material-direction studies without stock or sourcing claims.
- Added a cabinetry-specific three-study gallery using the existing accessible dialog, focus return, Escape handling, labelled navigation and live image-position announcement.
- Added a responsive scope process and final enquiry CTA.
- Preserved SSR rendering, noindex demonstration behavior and the existing quotation workflow.

## Files changed

- `apps/public-web/src/app/app.routes.ts`
- `apps/public-web/src/app/content-api.service.ts`
- `apps/public-web/src/app/public.page.ts`
- `apps/public-web/src/styles.scss`
- `tests/e2e/phase-03-public.spec.ts`
- `tools/capture-ui-06.mjs`
- Screenshot evidence listed below
- This report

## Screenshots

- `docs/development/screenshots/ui-06-desktop-cabinetry.jpg`
- `docs/development/screenshots/ui-06-mobile-cabinetry.jpg`

## Verification

| Check                               | Result | Actual outcome                                                                                                                     |
| ----------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm build:public`                 | PASS   | Angular browser/server bundles built and static routes prerendered.                                                                |
| `pnpm test -- --project public-web` | PASS   | Public-web unit tests passed.                                                                                                      |
| `pnpm test:e2e:phase03`             | PASS   | Full public browser suite passed, including cabinetry published content, enquiry link, dialog accessibility and responsive reflow. |
| `pnpm format:check`                 | PASS   | All Prettier-managed files passed.                                                                                                 |
| `git diff --check`                  | PASS   | No whitespace errors.                                                                                                              |

The host uses Node 23.5.0 and emits the known odd-numbered non-LTS warning; the repository remains pinned to Node 24.19.

## Limitations and follow-up

- No verified cabinetry photography or approved media derivatives are currently published. The showcase therefore uses one repository-owned synthetic concept and labelled abstract studies.
- Material studies communicate direction only; actual availability, suitability, samples and sourcing require confirmation.
- Separate public category records should be introduced only through the existing editorial publication workflow if richer category pages are later required.

## Git status

No commit or push was performed.

Suggested commit: `feat(public): enhance cabinetry and interior design showcase`
