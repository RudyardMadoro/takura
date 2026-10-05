# Contributing

## Branch and review model

The intended GitFlow branches are `main`, `develop`, `feature/*`, `release/*` and `hotfix/*`. For this phase, create `feature/phase-01-foundation` from `develop` after reviewing the uncommitted work. Configure branch protection for `main` and `develop`: pull-request review, required passing checks, no force pushes, no branch deletion and restricted release/tag permissions. Confirm the repository plan supports protected deployment environments; otherwise use a documented manual operator gate.

Automation must never create developer commits. CI checks source and artifacts; deployment workflows added later must promote immutable reviewed manifests and use no secrets for untrusted pull requests.

## Local checks

Install Node 24.19.0, Java 21 and Docker Desktop. Enable Corepack and use the exact package manager in `package.json`.

```text
pnpm install --frozen-lockfile
docker compose up -d postgres
cd backend && ./mvnw verify
cd .. && pnpm api:check && pnpm format:check && pnpm test && pnpm build
```

On Windows, use `backend\mvnw.cmd verify`. Run demo data only with `TAKURA_ENVIRONMENT=local` and `./ops/seed-demo.ps1`. The reset script refuses every environment except an explicitly supplied `local`.
