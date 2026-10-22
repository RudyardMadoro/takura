# Codex Implementation Prompt — Takura Properties Public Website UI/UX Modernization

## 1. Context

We are developing the Takura Properties platform, a property development, construction, renovations, cabinetry manufacturing, and board supply business website.

The first 10 development phases have largely been completed.

Phase 10 has successfully passed the executable local release qualification gates. However, full production deployment and external infrastructure acceptance remain blocked because the production servers, cloud infrastructure, and related services are not yet provisioned.

We want to continue local development by significantly improving the visual design, user experience, responsiveness, and presentation quality of the **public-facing website**.

The primary visual inspiration is:

**Theratio — Interior Design & Architecture HTML5 Template**

Reference:
https://themeforest.net/item/theratio-interior-design-architecture-html5-template/29953734

We want a beautiful, elegant, contemporary, engaging website comparable in visual quality to premium architecture, luxury interior design, and property development websites.

The design should be appropriate for Takura Properties' business model rather than a literal reproduction of Theratio.

### Important boundaries

- Continue using the existing monorepo and technology stack.
- Preserve existing functionality and integrations.
- Reuse existing APIs wherever possible.
- Update the backend only where necessary.
- No production infrastructure or server provisioning is required.
- All development and testing should work locally.
- Do not automatically commit, push, merge, or tag changes.
- Suggest a suitable Git commit message when complete.

## 2. Existing project documentation

Before making code changes, inspect the project documentation and existing source code.

Identify and review the relevant:

- Requirements document.
- Functional and non-functional specifications.
- Architecture documentation.
- Development phases and progress reports.
- Phase 10 report.
- R1 traceability matrix.
- Public frontend application.
- Backend Spring Boot application.
- Shared libraries and generated API clients.
- Staff portal functionality related to managing public content.
- Existing E2E tests, fixtures, and development scripts.

Use the repository as the authoritative source of truth for actual framework choices, directory structures, API contracts, routes, and business requirements.

Do not assume file paths or endpoint names without inspecting them.

If documentation and implementation differ, identify the discrepancy and avoid destructive changes.

Do not reopen deferred R2/R3 functionality merely because it appears in a design reference.

## 3. Primary objective

Modernize the entire existing public-facing website.

The new website should:

1. Have the visual quality of a modern premium architectural firm.
2. Communicate Takura Properties' services professionally.
3. Showcase actual properties, completed projects, construction work, and cabinetry.
4. Present board supply and cut-to-size services clearly.
5. Encourage customers to make enquiries and request quotations.
6. Work exceptionally well on desktop, tablet, and mobile.
7. Retain existing business functionality.
8. Support server-side rendering, SEO, accessibility, and good performance.
9. Remain maintainable and consistent with the existing architecture.

Do not replace the public application with a separate static website.

## 4. Visual design inspiration

Take inspiration from Theratio's:

- Large architectural hero photography.
- Elegant layouts and typography.
- Beautiful project portfolios.
- Dark and light section combinations.
- Spacious content presentation.
- Sophisticated image galleries.
- Minimalistic navigation.
- Refined buttons and interactions.
- Subtle scroll transitions.
- Professional service presentation.
- Responsive project grids.
- Modern footer layouts.

Design a cohesive Takura Properties identity rather than blindly copying Theratio.

If a licensed Theratio package is available locally, inspect its documentation and license before reusing assets.

Otherwise, implement original components inspired by its general design language.

Do not download, copy, or embed unlicensed commercial assets, copyrighted demo photography, or proprietary template source code.

## 5. Design system

Create or improve a shared visual design system.

Suggested direction:

- Primary: charcoal (#20211F).
- Accent: warm bronze (#B18B5B).
- Background: ivory (#F5F2EA).
- Secondary neutral: sand (#DFD5C6).
- Complementary accent: muted olive (#64705D).

These are suggestions, not mandatory replacements for established brand colors.

Inspect existing logos, colors, fonts, and assets first.

Implement consistent:

- Typography hierarchy.
- Spacing and sizing scales.
- Layout containers.
- Responsive breakpoints.
- Buttons.
- Navigation elements.
- Form fields.
- Cards.
- Galleries.
- Modals/dialogs.
- Loading and empty states.
- Error and success messages.
- Focus and hover states.
- Animations.

Use CSS variables or the existing design-token strategy where appropriate.

Avoid introducing multiple conflicting styling systems.

Prefer the existing frontend component model and established libraries.

## 6. Implementation work packages

### WP01 — Existing application assessment

Audit all existing public routes, components, pages, API integrations, and functionality.

Identify:

- Components suitable for reuse.
- Components requiring redesign.
- Missing functionality.
- Duplicated UI patterns.
- Current mobile usability problems.
- Existing content and image handling.
- SSR and SEO implementation.
- Accessibility and performance issues.
- Backend gaps directly affecting the intended presentation.

Produce a short assessment in Markdown before implementation.

Do not use this assessment as an excuse to replace stable, working application architecture.

### WP02 — Global layout and navigation

Redesign the public site shell.

Implement or modernize:

- Desktop navigation.
- Sticky or responsive header.
- Mobile navigation drawer.
- Brand/logo presentation.
- Footer.
- Breadcrumbs.
- Consistent page headers.
- Section titles.
- Global calls to action.
- Accessible navigation states.

Navigation should reflect the services and routes actually supported by the system.

Avoid adding dead navigation links or non-functional buttons.

### WP03 — Homepage modernization

Rebuild the homepage with a premium architectural presentation.

Suggested sections:

1. Hero with impressive architectural/project imagery and compelling business messaging.
2. Introduction to Takura Properties.
3. Core business divisions.
4. Featured property developments.
5. Featured construction and renovation projects.
6. Kitchen and cabinetry showcase.
7. Board supply and cut-to-size offering.
8. Why choose Takura Properties.
9. How the enquiry/project process works.
10. Testimonials, only where verified and approved.
11. Prominent request-a-quotation CTA.
12. Contact information and footer.

The homepage must be data-driven wherever corresponding APIs and content models already exist.

Avoid inventing statistics, completed projects, testimonials, certifications, or business achievements.

Use appropriate empty states when content has not yet been published.

### WP04 — Construction and renovation services

Redesign the corresponding public service and detail pages.

Where supported by existing data, include:

- Professional service photography.
- Service descriptions.
- Project examples.
- Before-and-after galleries.
- Relevant work categories.
- Project enquiry CTAs.
- Clear contact pathways.

Reuse existing content and API contracts.

Do not fabricate project details.

### WP05 — Property development and portfolio

Modernize project and property listings.

Provide, where supported:

- Beautiful responsive project cards.
- Category or project-type filtering.
- Project detail pages.
- Multi-image galleries.
- Property/project descriptions.
- Relevant project attributes.
- Clear enquiry actions.
- Related or featured projects.

Maintain all existing publication rules.

Do not display unpublished or private content.

Use existing routes or preserve backward compatibility if routes must change.

### WP06 — Cabinetry and board supply

Improve presentation of:

- Kitchens.
- Wardrobes.
- Vanities.
- TV units.
- Custom cabinetry.
- Board supply.
- Full-sheet requests.
- Cut-to-size requests.

Implement beautiful galleries, service/product cards, clear specifications, and appropriate enquiry actions.

Maintain the distinction between existing business workflows.

Preserve the established full-sheet, attachment-supported, and assistance-request paths wherever they currently exist.

Do not introduce checkout, online payments, inventory management, fabrication automation, or automatic quote generation unless already explicitly supported by the accepted requirements.

### WP07 — Enquiry and quotation experience

Improve the appearance and usability of existing enquiries.

Requirements:

- Responsive layouts.
- Clear form labels.
- Field-level validation messages.
- Helpful progress and success states.
- Accessible error summaries.
- Consistent CTA placement.
- Appropriate project/service context.
- Improved file attachment experience.
- Good keyboard and mobile usability.

Preserve existing server-side validation and security requirements.

Do not weaken:

- Upload authorization.
- Session ownership.
- File association rules.
- Malware scanning.
- Object visibility controls.
- Private download authorization.
- Publication restrictions.

Make improvements around the existing secure workflows rather than bypassing them.

### WP08 — Backend integration and content enhancements

Audit current APIs before introducing changes.

Reuse existing backend services, DTOs, database entities, and generated API clients wherever possible.

If genuinely needed for the refreshed UI, introduce limited backward-compatible extensions, such as:

- Featured-project selection.
- Homepage section data.
- Gallery image ordering.
- Project cover-image selection.
- Service display ordering.
- Existing content SEO metadata.
- Public-safe content summaries.

Do not add speculative features or unnecessary database tables.

If migrations are necessary:

- Use the existing migration framework.
- Maintain backward compatibility.
- Avoid destructive migrations.
- Add appropriate integration tests.
- Preserve existing data.
- Respect staff-side authoring and publication controls.

Never expose staff-only data to public endpoints.

If backend changes create new staff-management requirements, implement only the minimal necessary complementary functionality.

### WP09 — Responsiveness, animation, and visual polish

Ensure exceptional presentation at:

- Small mobile widths.
- Standard mobile widths.
- Tablets.
- Laptop screens.
- Large desktop screens.

Improve:

- Image cropping and aspect ratios.
- Typography scaling.
- Grid behavior.
- Navigation usability.
- Form layouts.
- Touch targets.
- Spacing.
- Content density.

Introduce restrained animations using existing suitable libraries or native CSS.

Support `prefers-reduced-motion`.

Do not introduce heavy animation libraries without a clear benefit.

Avoid scroll hijacking, forced autoplay with sound, layout shifts, and excessive animation.

### WP10 — SEO, performance, and accessibility

Preserve and improve:

- SSR compatibility.
- Route-level metadata.
- Semantic heading hierarchy.
- Canonical URLs.
- Image alt text.
- Lazy loading of non-critical images.
- Appropriate image sizes and formats.
- Core Web Vitals.
- Keyboard navigation.
- Visible focus indicators.
- Dialog accessibility.
- Color contrast.
- Form accessibility.

Use semantic HTML and accessible component patterns.

Do not access browser-only globals during server rendering without suitable guards.

Avoid third-party trackers or external dependencies that are unnecessary for the functionality.

## 7. Content and imagery

Where actual company-owned media is available, use it according to existing rights and publication controls.

Otherwise:

- Use explicitly approved or appropriately licensed placeholder assets.
- Keep placeholder content clearly distinguishable from verified business information.
- Never present stock photography as actual completed company projects.
- Do not publish user-uploaded attachments without approved publication rights.
- Do not copy Theratio's demo photography without a valid license.

Optimize media sizes and image delivery.

Reuse existing storage, derivative, and publishing mechanisms.

## 8. Local development constraints

This work must run entirely in the existing local development environment.

Use the repository's existing local development instructions and scripts.

Do not require:

- Purchasing or provisioning a Contabo VPS.
- Provisioning AWS resources.
- Configuring production domains.
- Public DNS changes.
- Production credentials.
- Production email services.
- Deployment to live environments.

Reuse the established local services, development containers, and test fixtures where appropriate.

Do not weaken security or enable unsafe production behavior to simplify local testing.

Do not modify production deployment infrastructure unless an essential, clearly justified compatibility fix is required; otherwise document it as deferred.

## 9. Testing and acceptance

Run existing checks and add appropriate regression tests.

Where supported by the repository, validate:

- Formatting.
- Linting.
- Type checking.
- Frontend unit tests.
- Public frontend build.
- SSR build/rendering.
- Backend Maven verification.
- API contract generation/checks.
- Local Playwright journeys.
- Accessibility.
- Responsive viewport behavior.
- Enquiry form submission.
- Secure file upload workflows.
- Project and service browsing.
- Public content visibility.
- Navigation and deep links.

Capture before-and-after screenshots for major pages at desktop and mobile sizes.

Verify both successful and error states.

Preserve the existing local acceptance baseline, including previously passing Phase 10 tests.

For any failed or blocked check, report:

- The exact test.
- The reason.
- Whether it is a regression.
- The implementation area affected.
- The required next step.

Do not mark a check as passed unless it was actually executed successfully.

## 10. Implementation sequence

Work incrementally in the following order:

1. Audit and document the existing application.
2. Implement the design system.
3. Modernize the public layout.
4. Rebuild the homepage.
5. Redesign service and portfolio pages.
6. Improve cabinetry and board supply presentation.
7. Improve enquiry and quotation UX.
8. Implement justified backend enhancements.
9. Complete responsive and accessibility improvements.
10. Run full local regression and document results.

Prefer small, reviewable changes.

Preserve existing APIs and behavior throughout.

If the task becomes too large to complete safely in a single execution, prioritize a fully functional vertical slice, document completed and remaining work, and avoid leaving the repository in a broken state.

## 11. Required documentation

Create or update suitable Markdown documentation describing:

- UI/UX modernization objective.
- Initial repository assessment.
- Existing and proposed component structure.
- Visual design decisions.
- Pages modified.
- Backend/API changes, if any.
- New dependencies and their rationale.
- Functional compatibility.
- Testing evidence.
- Known limitations.
- Remaining improvements.

Store these documents using the repository's existing documentation conventions.

Do not modify the historical Phase 10 report to imply that external production blockers have been resolved.

## 12. Strict Git instructions

Do not automatically:

- Commit code.
- Push branches.
- Merge branches.
- Create tags.
- Deploy applications.

Keep all changes available for manual review.

Do not discard unrelated existing changes.

At the end, provide a suggested Git commit message using the project's established convention.

Suggested format:

`feat(public): modernize Takura Properties website with premium architectural UI`

Adjust the final message to reflect the changes actually implemented.

## 13. Final implementation report

Provide a concise but complete report covering:

1. Summary of implemented enhancements.
2. Pages and components modified.
3. New reusable design components.
4. Backend and database changes.
5. APIs reused.
6. UI/UX improvements.
7. Mobile and accessibility improvements.
8. Test results, with actual PASS/FAIL/BLOCKED status.
9. Known issues or incomplete areas.
10. Files changed.
11. Suggested Git commit message.

## 14. Definition of done

The work is complete when:

- The public website has a cohesive, premium architecture-inspired design.
- The homepage is significantly modernized.
- Major service and portfolio pages follow the same design system.
- Board supply, cabinetry, and enquiry journeys remain functional.
- Existing public APIs are reused wherever possible.
- Any necessary backend enhancements are backward-compatible.
- The website works locally without production infrastructure.
- The site is responsive, accessible, performant, and SSR-compatible.
- Existing local regression tests remain passing.
- New functionality has appropriate automated test coverage.
- Documentation accurately describes completed work.
- No changes have been automatically committed or pushed.

**Proceed with repository inspection followed by incremental implementation. Make the necessary code changes rather than stopping at a design proposal. Prioritize delivering a beautiful, polished, functional public website while preserving everything that already works.**
