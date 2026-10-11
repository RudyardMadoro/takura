# End to end tests

Browser journeys are added with the functional vertical slices. Phase 01 verifies the independent application shells through their unit and production builds.

## Phase 03 public accessibility and responsive regression

Start the local PostgreSQL-backed API with demo data and the production public SSR bundle, then run:

```powershell
pnpm test:e2e:phase03
```

The suite uses installed stable Chrome and covers the required CSS-pixel viewports, 200% reflow,
keyboard/screen-reader semantics, the gallery dialog, WCAG A/AA axe checks, hydration and dynamic
404 behavior. Set `TAKURA_PUBLIC_URL` when the SSR host is not `http://127.0.0.1:4000`.
