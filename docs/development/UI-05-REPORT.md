# UI-05 — Premium Property & Project Portfolio

Date: 2026-10-22  
Status: PASS

## Outcome

The public project index and project detail experience now use the premium architectural portfolio language established in UI-01–UI-04. Published concepts are presented through editorial grids, explicit status/context metadata, responsive synthetic studies, an accessible stage gallery, related-project navigation and a property-enquiry call to action.

The implementation continues to use the published public content API. It does not expose drafts, archived entries, private media or staff context, and it introduces no property availability, price, specification, completed-work or achievement claim.

## Content and API decisions

- `/projects` continues to use `GET /api/v1/projects?page_size=12`; backend featured/publication/ID ordering is preserved.
- `/projects/:slug` continues to use the published-only detail endpoint and now also resolves the same published listing for related concepts.
- Titles, summaries, publication revision and approximate context are rendered from the existing public DTO and `metadata_json`.
- Invalid or absent metadata degrades to the neutral label `Concept context`; it does not invent a location.
- The public DTO does not currently expose `category_code`, so no unsupported category controls were fabricated. The backend category query remains available for future editorial categories.
- Existing media publication clearance remains unchanged. CSS-generated studies are labelled synthetic and do not bypass the media pipeline.

## Implementation

- Replaced basic project cards with a featured-first responsive portfolio grid.
- Added clear ownership/status and approximate-context labels.
- Added a two-column project hero with published metadata and an explicit concept disclaimer.
- Reframed the existing keyboard-accessible before/during/after gallery within the new portfolio composition.
- Added responsive narrative, enquiry and related-project sections.
- Preserved the existing modal focus behavior, Escape close, return focus, labelled previous/next controls and live image-position announcement.
- Added resolver fallback behavior so a related-project API failure does not make the current published detail unavailable.

## Files changed

- `apps/public-web/src/app/app.routes.ts`
- `apps/public-web/src/app/content-api.service.ts`
- `apps/public-web/src/app/public.page.ts`
- `apps/public-web/src/styles.scss`
- `tests/e2e/phase-03-public.spec.ts`
- `tools/capture-ui-05.mjs`
- Screenshot evidence listed below
- This report

## Screenshots

- `docs/development/screenshots/ui-05-desktop-projects.jpg`
- `docs/development/screenshots/ui-05-desktop-project-detail.jpg`
- `docs/development/screenshots/ui-05-mobile-project-detail.jpg`

## Verification

| Check                               | Result | Actual outcome                                                                                                                         |
| ----------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm build:public`                 | PASS   | Browser/server bundles built and static routes prerendered.                                                                            |
| `pnpm test -- --project public-web` | PASS   | Public application unit tests passed.                                                                                                  |
| `pnpm test:e2e:phase03`             | PASS   | Public browser suite passed, including portfolio listing/detail, modal keyboard behavior, responsive routes, 200% zoom and WCAG scans. |
| `pnpm format:check`                 | PASS   | All Prettier-managed files passed.                                                                                                     |
| `git diff --check`                  | PASS   | No whitespace errors.                                                                                                                  |

The host uses Node 23.5.0 and emits the known odd-numbered non-LTS warning; the repository remains pinned to Node 24.19.

## Limitations and follow-up

- No verified project photography or cleared media derivatives exist in the current published fixtures. Synthetic studies are used honestly instead.
- Filtering should be added only after public category values and published category vocabulary are available to the frontend.
- Pagination remains the existing first 12 published entries. A follow-up can add cursor navigation when the published collection exceeds one page.

## Git status

No commit or push was performed.

Suggested commit: `feat(public): modernize property and project portfolio experience`
