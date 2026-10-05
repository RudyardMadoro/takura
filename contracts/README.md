# API contracts

`openapi.yaml` is the version 1.0 external contract under `/api/v1`. External JSON names are snake_case. IDs are opaque strings, instants use UTC ISO 8601, dates use `YYYY-MM-DD`, and money uses exact decimal strings plus ISO currency. The generated Angular client is committed under `libs/api-client/src/generated`; `pnpm api:check` regenerates it and fails on drift.
