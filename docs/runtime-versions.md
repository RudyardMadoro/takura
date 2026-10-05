# Runtime versions

Verified at implementation kickoff on 5 October 2026. Exact application dependencies are locked by `pnpm-lock.yaml` and the Spring Boot dependency BOM.

| Component       | Pinned version or reference | Rationale                                                                                          |
| --------------- | --------------------------- | -------------------------------------------------------------------------------------------------- |
| Node.js         | 24.19.0 LTS                 | Supported LTS line and satisfies Angular 22 (`^24.15.0`).                                          |
| pnpm            | 11.25.0                     | Exact package manager recorded in `package.json`.                                                  |
| Angular and CLI | 22.2.1                      | Current supported Angular 22 GA line; public app uses SSR and staff app uses CSR.                  |
| TypeScript      | 6.0.2                       | Within Angular 22's supported `>=6.0.0 <6.1.0` range.                                              |
| Java            | 21.0.10 LTS                 | Conservative LTS runtime supported by Spring Boot.                                                 |
| Spring Boot     | 3.5.16                      | Supported stable 3.x line, selected to retain mature Java 21 and Jakarta ecosystem compatibility.  |
| Maven Wrapper   | 3.9.11                      | Pinned wrapper distribution; no system Maven is required after bootstrap.                          |
| PostgreSQL      | `postgres:17.11-alpine3.24` | Current supported PostgreSQL 17 maintenance release, within Flyway's tested range; never `latest`. |

Official compatibility checks:

- Angular release/support schedule: https://angular.dev/reference/releases
- Angular Node.js and TypeScript compatibility: https://angular.dev/reference/versions
- Node.js release status: https://nodejs.org/en/about/previous-releases
- Spring Boot stable documentation: https://docs.spring.io/spring-boot/
- PostgreSQL versioning and current minors: https://www.postgresql.org/support/versioning/

Container tags are pinned to a release and Alpine base. Before a production release, resolve reviewed image tags to immutable registry digests in the release manifest. Phase 01 does not authorise pulling or deploying production images.
