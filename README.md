# Takura property transformation platform

Reproducible three-tier monorepo foundation for a public property-services and board-sales website, staff operations application and modular Spring Boot backend. Every visible business value is synthetic until confirmed. Demo contacts use the reserved `example.invalid` domain, outbound communication is a local test sink, preview pages are nonindexable, and payments are disabled.

## Repository map

- `apps/public-web`: Angular SSR public shell on port 4200 in development and 4000 when serving the built renderer.
- `apps/staff-web`: separate Angular CSR staff shell on port 4201.
- `libs`: generated API client, domain types, UI library and design tokens.
- `backend`: Java 21/Spring Boot modular monolith; API on 8080 and private management on loopback 9090.
- `contracts`: OpenAPI 1.0 source and deterministic generator configuration.
- `infra`: Contabo launch and AWS migration-target documentation.
- `ops`: guarded demo/reset tooling and operational notes.
- `tests/e2e`: future vertical-slice browser journeys.
- `docs/source`: authoritative Requirements v1.2, Specification v1.1 and Architecture v1.0 documents plus mechanical Markdown extracts.

## Prerequisites

Use Node 24.19.0, pnpm 11.25.0, Java 21 and Docker Desktop. Exact rationale is in `docs/runtime-versions.md`. The Maven Wrapper downloads Maven 3.9.11.

## One-command workflows

```powershell
pnpm install --frozen-lockfile
docker compose up -d postgres
cd backend
.\mvnw.cmd verify
cd ..
pnpm api:check
pnpm format:check
pnpm test
pnpm build
```

Run the applications in separate terminals:

```powershell
pnpm start:public
pnpm start:staff
cd backend
$env:SPRING_PROFILES_ACTIVE='local'
.\mvnw.cmd spring-boot:run
```

Start the worker from the same backend artifact with no HTTP business server:

```powershell
cd backend
$env:SPRING_PROFILES_ACTIVE='local,worker'
.\mvnw.cmd spring-boot:run
```

Migrations run with `takura_migrator`; the application connects as `takura_runtime`, which has no schema mutation or table-drop privileges. To load deterministic demo values after migration:

```powershell
$env:TAKURA_ENVIRONMENT='local'
.\ops\seed-demo.ps1
```

`ops/reset-local.ps1` refuses anything except an explicit local environment. It removes the local named database volume, so use it only when disposable local data is intended.

## Contracts and safety

The API prefix is `/api/v1`; external JSON uses snake_case. The committed generated client lives under `libs/api-client/src/generated`, and `pnpm api:check` detects drift. Public health/config endpoints are intentionally minimal. Every other endpoint is denied until phase 02 supplies federated staff identity. Request bodies are never logged; caller correlation IDs are validated before being returned or placed in logging context.

The baseline Word documents must retain these filenames under `docs/source/`:

- `Property_Transformation_Website_Requirements_Updated.docx`
- `Property_Transformation_Website_Specification_Updated.docx`
- `Property_Transformation_Website_Architecture.docx`

See `CONTRIBUTING.md` for GitFlow and protection settings. CI runs with read-only repository permissions and does not receive deployment secrets on pull requests.
