# Phase 03 — Responsive public website and editorial content

First iteration (R1) · Prompt pack version 1.0 · 5 October 2026

**Prerequisites:** Phases 01–02 complete; staff grants/settings available.

**Source traceability:** FR 01–06, 08–09, 21–22, 25–26; SP 02–05, 19–20, 26–27, 32; AR 01, 16–17; T01, T18, T20, T23; AAT 01, 12.

Copy the entire “Codex implementation prompt” section below into Codex while the project repository is open. Attach the three baseline documents or place them under `docs/source/`. Execute one phase at a time and review its report before starting the next. This file is an implementation instruction, not an estimate or an assertion that code already exists.

## Codex implementation prompt — Phase 03: Responsive public website and editorial content

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

Write/update this phase's report at `docs/development/phase-03-report.md`, substituting the current phase number. Include files changed, architecture decisions and source mappings, migrations/configuration, commands run and actual outcomes, acceptance criteria status, limitations/provider checks still pending, and a short next-phase handoff. Use PASS/FAIL/BLOCKED/NOT RUN accurately. Then summarise this to me, list any remaining blockers, confirm that no changes were committed or pushed, and **suggest one conventional commit message without executing it**. Do not claim completion if a required check failed or was not run.

### Outcome

Implement the marketing experience and working draft/publish content management. Clearly present property transformation, custom cabinetry and standalone board supply as primary offers. The board page is a prominent route and commercial proposition; its live catalogue arrives in phase 04.

### Implementation tasks

1. Build P01–P07 and P12–P14, P18–P19: home, property transformation, services and service detail, project index/detail, cabinetry, about, contact, FAQs, privacy/terms and correct not-found views. Add navigation to `/boards`, `/workshop/board-cutting`, `/hardware` and `/request-quote` as the following phases enable them. Avoid dead CTAs or misleading forms: disabled upcoming routes use a useful unavailable state and are omitted from production navigation until functional.
2. Use the specified charcoal/off-white/timber palette as a replaceable starting point; verify contrast. Implement reusable header/footer, mobile navigation, service cards, process sections, proof/case-study blocks and purposeful quote CTAs. Keep board supply visually prominent. Cabinetry explains SUPPLY_ONLY and FIX_AND_SUPPLY. Property content discusses feasibility and approvals without promising legal unit counts, income or regulated services.
3. Build content/service/project persistence and A07 editors with structured fields, required sections, category links, immutable revision history and DRAFT/PUBLISHED/ARCHIVED states. Validate slugs (3–100 characters, unique, reserved-path restrictions), preserve old published slug redirects and prevent redirect loops. Sanitise rich text with an allowlist. Gate EDIT_CONTENT and PUBLISH_CONTENT separately and use optimistic concurrency.
4. Project fields include ownership designation, approximate location, narrative and verified optional facts. Seed three visibly synthetic owner-development concepts per SP 30. Do not portray them as client commissions or completed real work. Testimonials/accreditation blocks remain absent without evidence. No exact property address or tenant data appears publicly.
5. Establish MediaAsset metadata/references and publication clearance checks now. Real upload/scan/derivative creation is phase 06. Until then, use safe repository-owned placeholder illustrations only in demo preview; production cannot publish DEMO_ONLY, PENDING, PRIVATE or unscanned customer media. Do not add a temporary unsigned/public-original shortcut. Approved external assets require explicit rights and controlled references.
6. Public listing/detail APIs return published revisions only with stable keyset pagination and allowlisted filters. Projects sort featured then publication date with ID tie-breaker. Default public page size 12. Board-related positioning may be editable content but cannot pretend to show a completed catalogue until phase 04.
7. Use Angular SSR/hydration for service and project pages. SSR fetches only public APIs and carries no staff identity or customer secret. Return genuine 404 status for unavailable content. Short public cache defaults to 60 seconds, content-hashed assets are immutable, publication invalidates API AND renderer caches and is visible within five minutes. Never cache private routes or tokens.
8. Implement unique titles/descriptions/canonicals, published-only sitemap and accurate structured metadata. Demo/staging have global noindex headers/meta and disabled real contact actions. Robots/noindex supplement authorisation and do not replace it. Contact placeholders use pending labels, no real map pin and no fabricated phone number.
9. Implement responsive galleries with reserved dimensions, captions, alt text, reduced motion, keyboard controls and accessible dialogs (focus trap, Escape, return focus, labelled next/previous, image-position announcement). Static before/during/after stages suffice; do not build an R2 slider. Keep body text readable and reading width reasonable.

### Verification and acceptance

- Review 320, 375, 768, 1024 and 1440 CSS-pixel layouts and 200% zoom. No horizontal page overflow; sticky actions do not cover focused controls or errors.
- Keyboard/screen-reader checks cover mobile menu, FAQs and gallery. Automated accessibility findings are fixed; document manual evidence.
- Inspect returned HTML without JavaScript: published service/project content and correct SEO are present; missing/draft routes return 404. Drafts never appear in sitemap/listing.
- Publish/edit/archive a synthetic revision in demo and verify both API and rendered page freshness within five minutes. Production refuses demo-only media and unverified portfolio claims.
- Editor cannot access lead APIs; publication requires a publish grant. Stale content updates return 412. Rendering and logs contain no private context.

### Handoff

Provide the page/content schema map, design tokens, supported routes, publication/cache strategy and instructions for replacing demo copy/images. Defer genuine image ingestion to phase 06 without weakening publication guards.
