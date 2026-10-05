# ADR 0001 Repository foundation

## Status

Accepted for R1 foundation on 5 October 2026.

## Decision

Use one Angular CLI workspace and pnpm lockfile for separate `public-web` SSR and `staff-web` CSR applications plus shared libraries. Use one Spring Boot modular monolith with API and non-web worker profiles, PostgreSQL with Flyway, versioned OpenAPI and a committed generated Angular client. Keep fake integrations restricted to local/test profiles and deny every nonpublic HTTP endpoint until explicit identity rules arrive in phase 02.

Generated client files are committed. CI regenerates them and fails when the working tree differs. This allows application builds without downloading the generator while still making contract drift visible.

## Source mapping

FR 26; SP 01-02, SP 21-22, SP 30-31, SP 36, SP 38; AR 01-05, AR 09, AR 13-16.
