# UI service restructuring report

Date: 2026-10-22  
Overall status: **PASS**

## Summary

The public website now presents Property Transformation as one primary service rather than six competing top-level services. The homepage retains its architectural hero and uses the strongest service-overview treatment as the start of a clearer journey: what Takura Properties does, how it helps, its divisions, published work, and quotation entry points.

No backend, API-contract, database, or staff-portal change was required. The existing published-content API already provides the canonical Property Transformation entry, while the public client can group its supported capabilities without destructively changing editorial records.

## Previous and new structure

| Area                    | Previous structure                                                                                                                                   | New structure                                                                                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Homepage                | Separate showcase layout with a compact service treatment                                                                                            | Existing architectural hero plus the premium service-overview grid, followed by published work, cabinetry, boards, process, and quotation sections |
| Services overview       | Construction, Renovations, Extensions, Property Conversions, Maintenance, Property Transformation, Custom Cabinetry, and Board Supply shown as peers | Retired after its consolidated content moved to the homepage; `/services` permanently redirects home                                               |
| Property Transformation | Competing `/property-transformation` and `/services/property-transformation` presentations                                                           | `/services/property-transformation` is canonical and contains all supported transformation capabilities                                            |
| Legacy URL              | Standalone page                                                                                                                                      | HTTP 308 redirect to the canonical page, preserving the query string                                                                               |

The retained Property Transformation capabilities are Construction, Renovations, Extensions, Property Conversions, Maintenance, and Interiors. Existing capability routes remain resolvable for backward compatibility, but are no longer promoted as top-level public services.

## Implementation

- `apps/public-web/src/app/public.page.ts`
  - Reused the services-overview card language on the homepage.
  - Introduced one top-level public service model shared by the homepage and related-service navigation.
  - Added the six capability sections to the canonical Property Transformation page.
  - Added contextual quotation links using the existing immutable service codes, so visitors enter the wizard with the relevant capability selected.
  - Removed the obsolete flat client-side service list.
- `apps/public-web/src/app/app.html`
  - Removed the redundant Services navigation entry and linked directly to Property Transformation.
  - Updated the footer to use the canonical service URL.
- `apps/public-web/src/app/app.routes.ts`, `app.routes.server.ts`, and `server.ts`
  - Redirect `/property-transformation` to `/services/property-transformation`.
  - Redirect the retired `/services` overview to `/`.
  - Return an SSR-host HTTP 308 redirect and preserve query parameters.
  - Exclude retired standalone pages from prerendering.
- `apps/public-web/src/styles.scss`
  - Extended the existing premium service-card primitives to capability sections and narrow screens.
- `tests/e2e/phase-03-public.spec.ts`
  - Added hierarchy, capability, contextual-enquiry, redirect, and query-preservation coverage.

## Routing, SEO, and data compatibility

- `/` is the sole services-led landing experience. `/services` permanently redirects to it while preserving query parameters.
- `/services/property-transformation` remains the sole canonical Property Transformation detail page and published API destination.
- `/property-transformation?source=legacy` responds with HTTP 308 to `/services/property-transformation?source=legacy`.
- The removed static route is no longer eligible for sitemap/prerender discovery. Existing dynamic service metadata and canonical generation continue to point at the retained page.
- Cabinetry, boards/cutting, and hardware remain visible and independently actionable.
- No service records were deleted, no schema was changed, and the staff content-management workflow is unchanged.

## Visual evidence

- `evidence/ui-service-restructuring/home-desktop.png`
- `evidence/ui-service-restructuring/property-transformation-mobile.png`

The screenshots verify the retained hero, four-offering overview, canonical capability layout, desktop hierarchy, and mobile stacking.

## Verification

| Check                             | Status | Actual result                                                                                                |
| --------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------ |
| `pnpm typecheck`                  | PASS   | All TypeScript projects passed.                                                                              |
| `pnpm test`                       | PASS   | Six frontend targets passed, 9 tests total.                                                                  |
| `pnpm test:e2e:r1`                | PASS   | 36 Playwright tests passed, including public, security, upload, and acceptance journeys.                     |
| Focused `phase-03-public.spec.ts` | PASS   | 17 tests passed, including the homepage hierarchy and both 308 query-preserving redirects.                   |
| `pnpm api:check`                  | PASS   | OpenAPI client regenerated deterministically with no contract diff.                                          |
| `pnpm build`                      | PASS   | Public SSR, staff CSR, shared libraries, and generated client built; 13 public routes prerendered.           |
| `backend\\mvnw.cmd verify`        | PASS   | 40 tests passed; all 10 PostgreSQL migrations applied and revalidated; JAR packaged.                         |
| `pnpm format:check`               | PASS   | Formatting passed before the report was added; final report formatting was rechecked at completion.          |
| Desktop/mobile visual review      | PASS   | Homepage and services reviewed at desktop width; canonical Property Transformation reviewed at mobile width. |

## Outstanding issues and limitations

- The host ran Node.js 23.5.0 and emitted the expected non-LTS warning; the repository remains pinned to Node.js 24.19 for supported development and release builds.
- Historical capability URLs are intentionally retained for inbound-link compatibility. They are not present in the top-level navigation.
- No production deployment or external account operation was performed.

## Post-review development-server repair

After visual review, API-backed pages opened through `ng serve` displayed the recoverable
“Content is unavailable” state. The public development server did not have the `/api` proxy
that was already configured for the staff application, so browser API requests were incorrectly
handled by Angular and returned 404.

- Added `apps/public-web/proxy.conf.json`, restricted to forwarding `/api` to the documented
  local backend at `127.0.0.1:8080`.
- Enabled that proxy only for the public development serve configuration.
- Documented that the local backend must be running for API-backed public routes.
- Live verification through port 4200 returned HTTP 200 for the projects and services APIs and
  rendered `/projects`, `/services/property-transformation`, and `/boards` without
  the unavailable state.

## Services overview retirement

The later decision to make the homepage the sole public service overview was applied without
removing any canonical detail pages:

- Removed Services from desktop navigation, mobile navigation, and footer links.
- Added Property Transformation directly to the primary navigation.
- Removed the duplicate overview template and its unused hero/CTA styling.
- Changed `/services` into an HTTP 308 redirect to `/`, preserving its query string.
- Kept `/services/property-transformation` and the backward-compatible capability detail URLs.
- Updated responsive, SEO, accessibility, and redirect regression coverage.

## Git status

All changes are local and uncommitted. No commit, push, merge, or tag was created.

Suggested commit message: `refactor(public): consolidate property transformation services and redesign homepage`
