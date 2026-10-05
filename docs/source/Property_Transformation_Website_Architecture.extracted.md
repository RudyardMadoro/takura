# Extract of Property_Transformation_Website_Architecture.docx

> Mechanically extracted from the authoritative DOCX; paragraphs and tables are preserved in document order where possible.

Property Transformation and Board Sales Website Architecture

First iteration solution architecture

Prepared for Rudyard Madoro and the business owner | 4 October 2026 | Architecture version 1.0

# 1 Architecture decision and scope

Build a three-tier application using Angular for presentation, Java and Spring Boot for business services, and PostgreSQL for relational persistence. Keep the code in one private GitHub monorepo. Deploy container images on a Contabo VPS using Docker Compose, and use AWS S3 for assets from the outset. Move the same application images to ECS Fargate and the database to RDS PostgreSQL when demand or availability requirements justify the cost.

The application tier is a modular monolith. Business modules have explicit ownership and interfaces but run in one API deployment and a separately configured background-worker deployment built from the same backend source. There is no requirement for microservices, Kubernetes, Kafka or a service mesh in this iteration. Separate workers protect enquiry latency from scanning, image processing and notification delays.

This document is the technical baseline for Requirements version 1.2 and Specification version 1.1. The existing business scope and SP 01 to SP 30 contracts remain valid. Architecture IDs AR 01 to AR 18 provide implementation and verification references. Business values remain configurable dummy values. Selecting technologies does not approve trading details, board capacity, professional claims or commercial policies.

R1 delivers the public website, standalone board catalogue, enquiries, private files, staff administration and quotation workflow. Email integration is live-ready in R1; WhatsApp click-to-chat is configurable. Automated WhatsApp and SMS have adapter contracts and sandbox coverage, but production activation requires an approved sender and operating policy. Hosted payment integration is designed and tested in isolation; checkout, receipts and reconciliation remain the later R3 capability unless explicitly promoted through scope control. Do not put a Pay button on R1 enquiries.

# 2 Decision register and alternatives

| ID    | Selected decision                                    | Main reason and tradeoff                                                                                               |
| ----- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| AR 01 | Angular with TypeScript and hybrid rendering         | Best fit for the developer's strongest frontend experience, complex forms and staff workflows; SSR adds a Node runtime |
| AR 02 | Java Spring Boot modular monolith                    | Shared transactions and simpler operations; enforce module boundaries to prevent coupling                              |
| AR 03 | PostgreSQL with Flyway migrations                    | No database licence fee, strong relational integrity and practical RDS migration; operations still cost money          |
| AR 04 | Private GitHub monorepo and Actions                  | One review and release chain; some private-repository controls require a paid plan                                     |
| AR 05 | Three logical tiers and container deployment         | Clear responsibilities while allowing API, worker and renderer processes to scale separately                           |
| AR 06 | S3 private storage and CloudFront for approved media | Durable assets and CDN delivery; cross-provider networking adds latency and transfer cost                              |
| AR 07 | Federated OIDC staff identity and JWT API access     | Avoid custom passwords; keep a minimal local staff authorisation registry                                              |
| AR 08 | PostgreSQL outbox and worker leases                  | Durable jobs without another broker; introduce SQS when justified                                                      |
| AR 09 | Actuator Micrometer and OpenTelemetry                | Standard metrics and tracing export; telemetry volume must be bounded                                                  |
| AR 10 | Provider adapters for messaging and payments         | Provider-specific protocols do not leak into business modules                                                          |
| AR 11 | Compose on Contabo then ECS Fargate                  | Reuse immutable images; launch VPS remains a single-host failure domain                                                |
| AR 12 | Measured latency and capacity budgets                | Validate real hosting geography; do not promise local latency from a distant VPS                                       |
| AR 13 | GitFlow with protected releases                      | Matches requested branching strategy; requires disciplined merge-back and artifact tracking                            |
| AR 14 | Automated CI and controlled CD                       | Reproducible releases and audited production deployment                                                                |
| AR 15 | Encrypted off-host backups and rehearsed recovery    | Persistent volumes alone are not backups                                                                               |
| AR 16 | OpenAPI and generated TypeScript client              | Stable web and future mobile contracts                                                                                 |
| AR 17 | Security boundaries for every record and object      | Federation authenticates identity but does not grant business access                                                   |
| AR 18 | Migration gates based on SLO and operational need    | Traffic alone is an incomplete scaling trigger                                                                         |

## 2 1 Angular compared with React

| Consideration          | Angular recommendation                                                      | React alternative                                                       |
| ---------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Developer fit          | Deep existing experience; use native router, forms and dependency injection | Comfortable but would require agreeing equivalent libraries             |
| Marketing SEO          | Angular SSR with hydration and selective prerendering                       | A React framework such as Next.js would supply SSR                      |
| Staff forms and tables | Structured Angular forms and lazy feature areas                             | Equally achievable with a chosen forms and data stack                   |
| Future mobile          | Ionic Angular and Capacitor with shared models and API clients              | React Native supports native UI but web DOM components need adaptation  |
| Performance            | Requires route splitting, image budgets and measured hydration              | Requires the same discipline; framework name is not a latency guarantee |

Choose Angular for this project. Official Angular documentation supports mixed rendering modes [S1], and Capacitor supports packaging web assets for native applications [S2]. React Native uses native components [S3]; selecting React today would not automatically make all website components reusable on mobile. A future Ionic app should have its own navigation and platform UX while sharing contracts, validation utilities and suitable presentation components. Do not wrap the SSR server inside a mobile app.

## 2 2 Database and repository choice

PostgreSQL is preferred over Oracle for this cost-sensitive deployment and is consistent with the user's own preference. Its licence permits use without a licence fee [S4]. MySQL remains a viable alternative, but there is no project-specific advantage that warrants changing the preference. Use relational columns for core states, ownership, amounts and joins; JSONB is appropriate for versioned service detail payloads with server-side validation. Do not store image or video binaries in PostgreSQL.

Choose GitHub because the proposed Actions, container registry and AWS OIDC workflow form one coherent delivery chain. GitLab could implement the same design and remains a valid organisational substitute. Do not base this decision on unverified claims that one provider is universally cheaper. Check current private-repository branch and environment features before selecting a plan. GitHub documents plan restrictions on private deployment environments and reviewer protection [S11].

# 3 Three tier topology and trust boundaries

Tier 1 contains public Angular rendering, browser interaction and the Angular staff application. Tier 2 contains the Spring Boot API, business modules, a worker and provider adapters. Tier 3 contains PostgreSQL and S3. CloudFront, reverse proxy, identity and observability services are supporting infrastructure, not additional business tiers. Clients never connect to PostgreSQL, receive AWS credentials or decide their own permissions.

The only authorised direct client-to-data path is an API-issued, restricted S3 upload capability. It permits one temporary object write and grants no listing or download permission. This controlled exception keeps large file bytes off the API request path. Downloads of customer quotation PDFs are proxied through the API when immediate revocation is required. Approved public image derivatives can be delivered through CloudFront.

Public routes and staff routes use one site origin initially. Nginx sends /api/v1 to Spring Boot, /admin assets to the static staff build, and public page requests to the Angular SSR process. The renderer accesses only public content endpoints. It carries no staff session, AWS secret or customer quote token into a shared rendering cache. The SSR process is part of presentation, not another business backend.

# 4 Presentation architecture and responsive behaviour

Use an Angular workspace with public-web and staff-web applications. Share the API client, domain types, accessibility primitives and design tokens through libraries. Keep public and staff bundles separate so a public visitor does not download the administration toolkit. Use Angular standalone components, lazy feature routes, reactive forms, typed request DTOs and deliberate change detection. Angular Material is suitable for staff tables and dialogs; use lightweight branded components for the public website. Add global state tooling only if complexity justifies it; services and signals are sufficient for initial feature state.

Use SSR for service, project and catalogue pages that must reflect content publication quickly. Prerender stable pages only when the publication mechanism can invalidate or rebuild them within the five-minute freshness contract. Hydrate interactive galleries and forms. Quote viewing, submission confirmation and staff administration are client-rendered, private and excluded from shared caches. SSR must return genuine 404 status for missing or unpublished content rather than a 200 shell.

Serve content-hashed JS and CSS with long immutable cache lifetimes. Public HTML and content responses use a short configurable cache, initially 60 seconds, plus explicit publication invalidation. Allow graceful stale public content during brief API outages, but do not serve stale private pages or obsolete service selections as trusted form authority. Submission validation uses current configuration. Use ETags for public metadata where useful and optimistic versions for staff edits.

Reserve image dimensions, provide responsive derivatives, lazy-load below-fold galleries and avoid autoplay hero videos. Public navigation, forms and staff dialogs must meet the existing WCAG 2.2 AA target at 320 to 1440 CSS pixels. Configure content security policy for the actual CDN and identity endpoints. A later PWA may cache public assets; it must exclude /api/v1/admin, quote pages, attachments, tokens and private form data.

# 5 Application modules and dependency rules

| Module         | Owned responsibilities                                           | Allowed collaboration                                          |
| -------------- | ---------------------------------------------------------------- | -------------------------------------------------------------- |
| content        | Services, pages, projects, FAQs, media clearance and publication | Catalogue and media metadata through published interfaces      |
| catalogue      | Board products, variants and supporting hardware                 | Published product snapshots supplied to enquiries              |
| enquiries      | Creation, validation, routing, assignment, state and activities  | Identity grants, file references and outbox in one transaction |
| assessments    | Staff appointments, conflicts, findings and status               | Enquiry guards and scoped staff access                         |
| quotations     | PDF revisions, approvals, issue and access grants                | Enquiry transitions, clean media and notifications             |
| media          | Upload sessions, S3 object versions, scanning and derivatives    | Content clearance and enquiry associations                     |
| identity       | Federated subject registry, teams, grants and active state       | Authorisation services used by every private module            |
| communications | Templates, provider adapters, delivery status and suppression    | Outbox jobs and channel consent records                        |
| payments       | Later checkout, receipts, refund and reconciliation records      | Accepted quote and contract milestone references               |
| operations     | Outbox leases, audit, settings, retention and health             | Cross-cutting mechanisms without business-rule ownership       |

Use packages organised by business module, with controller, application, domain and infrastructure subpackages. Controllers translate HTTP; application services enforce use cases and transactions; domain code owns state guards; infrastructure implements repositories and integrations. Modules cannot read another module's repositories directly. Keep a small shared kernel for IDs, money, timestamps and safe errors. Use ArchUnit or equivalent architecture tests to detect cycles and prohibited dependencies. Spring Modulith can be evaluated later; it is not required to establish boundaries.

Use Spring MVC, Spring Security, Jakarta Bean Validation, Spring Data JPA for ordinary entity work and explicit SQL for queue leases and reporting where appropriate. Prefer blocking MVC with bounded thread and connection pools for this initial workload. A reactive stack is unnecessary without measured benefit. Disable automatic production schema updates and open-session-in-view. Explicitly fetch the data required for DTOs; test for N+1 queries. Use Maven Wrapper and the Spring Boot dependency BOM. Choose supported GA Java, Spring Boot, Node, Angular and PostgreSQL versions together at implementation kickoff; pin exact versions and container digests, and record them in the repository. Do not use snapshot or beta versions for production.

# 6 PostgreSQL persistence and durable background work

Use one PostgreSQL instance and database per environment with module-owned tables. Use UUID identifiers, timestamptz for instants, numeric monetary values and explicit currency, foreign keys and uniqueness constraints. Store indexed state, assignee, due date and publication columns outside JSONB. Use @Version for staff concurrency and map stale writes to the specification's 412 response. Keep migrations append-only with checksums; separate a migration role from runtime roles. Runtime users must not create schemas or drop tables.

Create compound indexes from actual queries, particularly enquiries by team/state/created_at/id, tasks by owner/due_at, catalogue filter attributes, notification events by state/next_at, and idempotency key namespace/hash. Use keyset pagination with deterministic ID tie-breakers. Start with a HikariCP pool of ten API connections and four worker connections as load-test assumptions; cap the combined pool below the database's connection capacity, leaving administrative and migration headroom. Tune from measurements rather than increasing every pool together.

Save the enquiry, request digest, service details, attachment associations and outbox events in one transaction. For duplicate submissions, inspect an existing idempotency record and return the recorded result before reapplying changed service or privacy-version validation. A competing first submission relies on uniqueness plus transactional retry. It must not create a second acknowledgement.

Workers claim due jobs using transactional row locks with SKIP LOCKED and a bounded lease. Commit the lease before calling a provider; never hold a database transaction open during an email call or malware scan. Store lease expiry, attempts, next_attempt_at, provider reference and deduplication key. Reclaim expired leases after worker crashes. External calls are at least once with deduplication or reconciliation; a crash after provider acceptance can produce DELIVERY_UNKNOWN. Preserve the existing 1, 5, 15, 60 and 240 minute demo retry schedule and manual failure review. Use database locks or unique job keys for reminders, cleanup and scheduled retention when multiple workers run.

SQS is the AWS growth option for long-running media or messaging jobs. The PostgreSQL transaction still writes an outbox; a relay publishes events to SQS and only then records dispatch. Consumers remain idempotent. Adding SQS never replaces the database transaction with an unsafe dual write.

# 7 Federated identity JWT and staff authorisation

No public customer accounts or customer passwords are required. Customers request quotes anonymously and view issued quotations through the existing revocable, scoped token exchange. Staff still need secure identities because the application exposes plans, customer details, approvals and exports. Use Amazon Cognito as the recommended managed OIDC broker with an approved Google Workspace or Microsoft Entra identity provider where available. Cognito supports third-party federation [S5]. The business's identity tenant and MFA capabilities must be confirmed; a development OIDC provider can supply synthetic identities meanwhile.

The Angular staff SPA uses OIDC Authorization Code with PKCE, state and nonce through a maintained client library. It sends access tokens to Spring Security's resource server. Validate signature, issuer, expiry, not-before, intended resource audience or the provider's equivalent access-token client binding, token type and required scopes. Cognito access-token validation must account for token_use=access and client_id; do not assume every access token has an ID-token-shaped aud claim. Never authorise the API using an ID token. Spring Security supports JWT resource-server verification [S6]. Configure the exact provider validation rules in automated tests.

Keep browser access tokens in memory. Do not store access or refresh tokens in localStorage. Initially use a 10-minute access-token target and avoid persistent browser refresh tokens; renew through the provider session or reauthenticate. The API checks local staff active status and grants on every private request. To implement the existing 30-minute idle and eight-hour absolute session contracts, create a staff session registry with a random session handle bound to issuer, subject and client. Return its handle on POST /api/v1/admin/session after valid authentication; subsequent calls carry X-Staff-Session and a valid JWT. The handle is not sufficient authentication on its own. GET session returns state; DELETE session ends it; deactivation and logout revoke it. Request activity is bounded and rate-limited; automated background polling does not extend idle time. After timeout, a new interactive login is required. Session creation checks a signed provider authentication timestamp, initially no older than five minutes, and the last revocation boundary; it cannot reset the eight-hour window from the same old authentication. A refreshed token alone does not establish new interactive authentication. Select a provider contract that exposes verifiable authentication time, and test that expired sessions cannot be recreated with old access tokens. Test these semantics rather than relying solely on JWT expiry.

StaffIdentity stores issuer, subject, display label, active state and provisioned_at. Unique (issuer, subject) avoids identity collisions. Administrators grant preapproved subjects or allowlisted organisational identities, then assign role/team/record permissions. A first federated login never grants Administrator. No password hash, password reset flow, customer registration or identity-provider account CRUD is built. Replace the former A10 user management screen with staff access management. Maintain an audited bootstrap procedure for the first administrator and recovery access with MFA held in the identity provider.

Federated upstream MFA must be enforced and tested for each permitted sign-in path; federation alone is not MFA. Sign-out clears local state and terminates the local session; provider logout behaviour is documented separately. Invalid or unknown JWKS keys fail closed with bounded discovery retries. Existing validated keys can remain cached within an approved interval during a provider outage. Never accept unverified tokens to improve availability.

# 8 Assets uploads quarantine and video handling

Use separate S3 buckets or strictly separated policies for quarantine, clean private files, approved public derivatives and backups, per environment. Enable Block Public Access and encryption. S3 object keys are generated; originals include checksum and exact object version in metadata. CloudFront uses Origin Access Control to read only the approved public derivative bucket [S7]. Private plans and quote PDFs are never exposed through the public media distribution.

For customer uploads, the API issues a short-lived presigned POST with exact key, size range, content-type conditions and allowed origin. The session lasts 60 minutes, but each upload credential initially lasts five minutes and may be renewed after quota checks. S3 presigned capabilities grant delegated access [S8]; they are bearer secrets and must never be logged. Completion checks actual size, object version and checksum. Copy the submitted object version into a write-protected scanning location, or otherwise pin that immutable version, before validating and scanning. Reusing an unexpired upload URL must not replace bytes already marked CLEAN. Scan the pinned bytes, then copy a clean version to private storage with a new generated key. Delete expired temporary versions under the cleanup policy.

Run ClamAV in an isolated scan service or worker container with updated signatures, bounded resources and no access to public serving paths. Signature checking, workbook expansion limits and malware scanning are separate checks. A scan outage leaves files quarantined. Safe worker image processing creates responsive JPEG/WebP or other supported derivatives, strips metadata and retains publication permission as an independent gate. Media readiness is not publication approval.

The public enquiry contract still accepts JPEG, PNG, WebP, PDF and XLSX only. Videos are a staff editorial capability, not a new customer attachment type. Initially use reviewed MP4 files, explicit admin size and duration limits, poster images and caption files; no autoplay. Proposed demo editorial limits are 100 MiB and two minutes, subject to capability and load testing. Keep videos private until cleared and serve approved versions through the CDN. Adaptive streaming or managed transcoding is a later costed addition. PDF customer quote delivery remains API-proxied with no-store headers; ordinary staff file links may last five minutes after permission checks.

# 9 Communications integration contracts

| Channel            | Proposed provider and phase                   | Required operational behaviour                                                         |
| ------------------ | --------------------------------------------- | -------------------------------------------------------------------------------------- |
| Email              | AWS SES in R1                                 | Verified sending domain, production access, delivery events and suppression            |
| WhatsApp link      | User-initiated configured link in R1          | No private form text or automatic message transmission                                 |
| Automated WhatsApp | Twilio WhatsApp adapter in later activation   | Approved sender, current template rules, opt-in evidence and status callbacks          |
| SMS                | Twilio SMS adapter in later activation        | Approved sender capability, country restrictions, consent policy and delivery tracking |
| Development        | Local sink such as Mailpit and fake providers | No real recipient delivery or charges                                                  |

SES sandbox restrictions and production access must be resolved before launch [S9]. Configure SPF, DKIM and DMARC, reviewed templates, bounce and complaint processing, and suppression of persistently failing recipients. Staff notifications contain references and authenticated links rather than customer plans. Use SES events delivered through SNS with authenticated callback validation, or a supported event sink. Process provider event IDs idempotently and reject untrusted notification URLs; subscription confirmation must use an allowlisted, verified mechanism.

Twilio documents WhatsApp Business integration [S10]. Each adapter must enforce the current channel rules at activation rather than hardcoding a policy assumed from this architecture. Separate requested service messages from marketing. Store channel consent purpose, source, version, timestamp and withdrawal where required. Validate Twilio callbacks with its supported signature verifier using the externally visible callback URL behind the proxy. Signature verification and raw provider-event storage must respect redaction and retention. Never switch a customer to another paid channel without an approved preference or fallback rule. Set per-channel daily spend limits and a kill switch. Retry transient failures, reconcile unknown delivery, and preserve saved enquiries when a provider is unavailable.

# 10 Payment gateway architecture for later activation

Use a PaymentGateway port with createHostedPayment, verifyNotification, fetchStatus and refund capabilities. Payfast hosted checkout is the provisional South African option; actual country, currency, merchant onboarding, supported methods, fees and contract suitability remain unconfirmed. Payfast provides custom integration and ITN security guidance [S12]. Do not select a payment provider solely from the user's provisional geography. If the country changes, implement an alternative adapter without changing the quotation domain.

The payable object is an approved contract milestone linked to an accepted quote revision, not a public enquiry or mutable catalogue price. The API calculates amount and currency from a frozen server record. Customer requests cannot set payable totals, merchant identifiers or redirect URLs. No card PAN or CVV is collected or stored. Hosted checkout reduces direct card-data handling but does not remove the business's compliance duties.

Define PaymentIntent, PaymentAttempt, ProviderEvent, Receipt, Refund and ReconciliationRecord separately from QuoteRevision. States include CREATED, PENDING, SUCCEEDED, FAILED, CANCELLED and EXPIRED; refund and dispute states are separate financial records. A browser success or cancel redirect is only a navigation event. An authenticated, verified provider notification or subsequent status reconciliation establishes the payment result. Validate the provider's current signature, merchant, amount, currency and server-verification requirements exactly; do not substitute a generic JWT check. Preserve raw bytes as needed for verification, within bounded retention and restricted access.

Use unique provider event and transaction references, transactional receipt creation and at-least-once webhook handling. A valid duplicate returns success without a second receipt. Mismatched amounts go to review, never mark the contract paid. Respond only after the event is durably stored; queue slow verification when the provider protocol permits it. Pending or ambiguous payments are reconciled by scheduled status checks. Partial deposits reduce the milestone balance, not the whole job balance. Refunds require explicit financial privilege and preserve the original receipt. Settlement reconciliation compares provider transaction records, expected receipts and bank payout evidence. Currency rounding uses minor units and documented rules.

Later routes are POST /api/v1/customer/payment-intents using a scoped customer grant, GET /api/v1/customer/payments/{id}, POST /api/v1/integrations/payfast/itn, and protected staff reconciliation/refund commands. Do not expose these when payment_enabled=false. Sandbox tests must cover forged callback, replay, wrong amount, timeout after checkout creation, success redirect without callback, partial payment and refund. An architecture-ready adapter is not permission to take live payments.

# 11 Observability requests tracing and audit

Use structured JSON logs, Spring Boot Actuator and Micrometer for metrics, Micrometer Tracing with an OpenTelemetry bridge and OTLP export for traces. Spring Boot documents metrics and supported tracing integrations [S13, S14]. Use one instrumentation owner per concern; do not layer a Java agent and manual auto-instrumentation without checking duplicate spans. Collect through an OpenTelemetry Collector. On Contabo, a compact Grafana stack with Prometheus, Loki and Tempo is the reference self-hosted option; a managed compatible backend can reduce VPS memory usage. Decide from measured capacity and operating cost.

Every request records timestamp, service, environment, release digest, method, templated route, status, duration, correlation_id, trace_id and safe outcome. Generate or sanitise incoming correlation IDs. Never log query strings on token routes, Authorization headers, cookies, presigned URLs, request bodies, uploaded bytes, customer descriptions or telephone numbers. Separate business audit events from diagnostic logs. Audit must persist actor, target, action and outcome even when trace sampling drops a request.

Propagate W3C trace context across proxy, SSR and API calls. For outbox work, store nonsecret originating trace context and create linked worker spans. Provider callbacks create a new trace linked through stored provider references; external providers may not propagate trace headers. Start with 10 percent head sampling for production traces and 100 percent in controlled tests. Error metrics cover all requests; head sampling alone cannot guarantee capturing every error trace. Tail-based error sampling can be added with a cost and privacy review. Low-cardinality metric labels use route templates and service families, never customer IDs or references.

Dashboards cover HTTP latency/error rate, JVM heap/GC, pool saturation, PostgreSQL locks and query duration, disk and inode usage, worker leases, scan age, outbox age, email outcomes, S3 transfer errors, CDN hit rate and later payment mismatches. Expose Actuator metrics only on a private management port; publicly expose minimal liveness/readiness without sensitive details. Liveness checks process health, not email-provider health. Readiness reflects critical data dependencies; dependency failure must not create restart loops.

Run an external uptime check from outside the VPS and verify a synthetic enquiry through a protected test path using dummy data. Initial alerts include two failed submission checks, scan age above 30 minutes, oldest notification above 15 minutes, disk above 80 percent and sustained API error or latency budget breach. Thresholds are tunable. Logs initially retain 14 days, traces seven days and metrics 30 days as demo operating assumptions; audit and business retention follow the approved source policies. An alert channel and accountable operator are required before public launch.

# 12 Latency availability and capacity budgets

Keep the existing p75 LCP 2.5 seconds, INP 200 milliseconds and CLS 0.1 targets, plus p95 metadata and enquiry persistence below one second at 20 concurrent users. Add an initial server-processing budget of 300 milliseconds p95 for cached public reads and 700 milliseconds for enquiry persistence, measured excluding file bytes, scans and provider delivery. These are test targets, not guarantees from an unselected VPS location.

Select the VPS region and AWS region after testing the real audience-to-VPS, VPS-to-S3 and identity-provider paths. For a provisional South African audience, evaluate AWS Africa Cape Town where the selected services are available; do not assume Contabo has a matching local region or that geography is approved. CloudFront helps public assets but cannot remove a long round trip for form persistence. Keep API and PostgreSQL close together and prevent cross-cloud SQL traffic.

API creation waits for a database commit and never for SES, Twilio or scanning. Use direct restricted uploads, connection reuse, bounded timeouts, CDN derivatives, content cache invalidation and SQL indexes. Start without Redis; shared rate limits and session state can use PostgreSQL. If contention or request volume justifies Redis, introduce it with a clear consistency policy and keep durable business records in PostgreSQL.

The source 99.5 percent monthly availability and 24-hour RPO/eight-business-hour RTO are operational targets. One VPS cannot provide high availability against host or regional failure. Report its actual uptime and test recovery. Even ECS needs multiple tasks, healthy load balancing and a resilient data tier; migration by itself is not an availability guarantee. Load tests must include cold starts, uncached catalogue pages, simultaneous uploads, background scan load and staff exports. Set limits from measured resource use and protect enquiry writes from bulk reporting.

# 13 Contabo deployment and operational security

Use a supported Linux distribution, Docker Engine and Compose. The initial planning envelope is four vCPU, 8 to 16 GiB RAM and SSD storage, subject to measured heap, PostgreSQL, scanning and telemetry consumption. This is a sizing assumption, not a purchased Contabo package or price quote. Benchmark before procurement; move telemetry off-host or increase memory if it competes with business workloads.

Compose services are nginx, public-web-ssr, api, worker, postgres, scanner and telemetry components. Keep frontend, API and worker containers immutable; use named persistent volumes for PostgreSQL and intentionally persistent telemetry only. Apply explicit CPU/memory limits, restart policies, health checks, non-root execution where supported, read-only root filesystems with dedicated temp mounts, dropped capabilities and log rotation. Never mount the Docker socket into application containers.

Only HTTPS and required redirect HTTP ports are public. Restrict SSH to approved administration paths with keys; prefer a VPN or narrowly allowlisted access. Database, scan service, metrics and deployment management ports stay private. Nginx terminates TLS, renews certificates, sets security headers, normalises trusted forwarding headers, enforces request limits and routes to internal services. Trust proxy headers only from configured proxy addresses. Strip untrusted inbound forwarding values. Set S3 CORS to exact site origins and method requirements.

Use separate development, staging and production databases, S3 buckets and identity clients. Prefer staging on a separate small VPS; isolated staging on the production host is an explicit budget compromise and must never share data, volumes, ports or secrets. Secrets are restricted host files mounted read-only, or a managed secret service; they are not baked into images, committed .env files or printed in pipeline logs. Contabo cannot automatically inherit an ECS task role. Use a narrowly scoped AWS principal for required S3/SES operations, rotate its credentials and consider short-lived federation only if operationally supported. Avoid root AWS keys.

Back up PostgreSQL daily to encrypted off-host storage and verify checksums. To meet the launch 24-hour RPO, monitor successful backup age rather than assuming the schedule ran. Use WAL archiving and point-in-time recovery if a tighter RPO is approved. Keep backup credentials unable to overwrite or delete retained backup sets where feasible. VPS snapshots are a supplement, not the only copy. Restore into an isolated environment quarterly and before launch, verifying file relationships, session revocation, quote history and deletion replay. Document rebuild of the host from Compose and infrastructure files within the eight-business-hour recovery target.

# 14 Monorepo structure and engineering conventions

| Path                           | Purpose                                                         |
| ------------------------------ | --------------------------------------------------------------- |
| apps/public-web                | Angular SSR public site and quote-view routes                   |
| apps/staff-web                 | Angular staff application                                       |
| libs/api-client                | Generated TypeScript client from approved OpenAPI               |
| libs/domain-types              | Shared web DTO helpers and enums without server authority       |
| libs/ui and libs/design-tokens | Accessible components and presentation tokens                   |
| backend                        | Maven project with module packages and API/worker profiles      |
| contracts                      | Versioned OpenAPI, error schemas and synthetic examples         |
| infra/contabo                  | Compose, reverse proxy configuration and deployment scripts     |
| infra/aws                      | Terraform modules for target ECS and supporting services        |
| ops                            | Dashboards, alerts, backup and incident runbooks                |
| tests/e2e                      | Browser journeys, integration fixtures and provider simulations |
| docs/adr                       | Decision records and current architecture                       |
| .github/workflows              | CI, staging, release and deployment workflows                   |

Use Angular CLI workspaces and package-manager lockfiles for the frontend, Maven Wrapper for Java and root task scripts for coordinated commands. Nx is optional later if dependency-aware caching materially helps; it is not necessary to create a monorepo. Git history contains source, migrations, infrastructure and documentation, not secrets, customer files, generated production dumps or video originals.

OpenAPI is the contract authority. Generate clients reproducibly and fail CI if generated output is stale or breaking changes are undocumented. Keep JSON snake_case externally and map idiomatic TypeScript/Java fields explicitly. Stable error codes, enum values, idempotency, optimistic concurrency and attachment scope remain unchanged. A mobile client uses the same API with its own OIDC client and allowed origins; native secrets cannot be safely embedded in the app.

# 15 GitFlow CI and CD release control

Use main for production history, develop for integration, feature/_ from develop, release/_ from develop and hotfix/\* from main. Merge release changes into main and back into develop; merge hotfixes into both. Require pull requests, passing checks and review of migrations, security and contracts. Tag production releases vMAJOR.MINOR.PATCH. Do not deploy arbitrary feature branches to production.

Feature PR pipelines run format/lint/type checks, frontend unit tests, Java unit and architecture tests, PostgreSQL Testcontainers integration tests, API contract checks and relevant Playwright journeys. Security checks cover dependencies, secrets, containers and infrastructure. Generate an SBOM and record dependency versions. Pull-request jobs run without production secrets; untrusted fork code cannot use a production runner or deployment key. Pin third-party Actions to reviewed commit SHAs and grant minimum workflow permissions.

Develop deploys a tested candidate to development. Release branches deploy to staging, where full enquiry, quote, access-control, upload, accessibility, load and recovery smoke checks run. Build images once per candidate commit and record a release manifest with commit SHA, image digests, migration version and test evidence. Production promotes those exact digests after a protected main merge/tag whose tree matches the tested release; never silently rebuild a different artifact because the merge commit SHA differs. A tagged hotfix runs the same relevant gates.

Use GitHub environments and branch restrictions where the selected plan supports them [S11]. If private-repository required reviewers are unavailable, a restricted manual deployment workflow, protected release PR and an approved operator form the interim gate; verify actual permissions and document the limitation. Do not imply an unavailable plan feature protects production. GitHub Actions obtains short-lived AWS deployment credentials through scoped OIDC role trust [S15]. Contabo deployment uses a dedicated restricted deploy identity, host-key verification and a narrowly scoped remote command. Prefer hosted runners and never run untrusted PR workloads on the production VPS.

Deployment serialises through an environment lock. Verify backups and image signatures/digests, run a one-shot migration job, start the candidate, wait for readiness, run smoke tests and switch reverse-proxy traffic. A small VPS may require a maintenance window rather than duplicate full capacity; document expected downtime. Use expand-and-contract migrations compatible with current and candidate code. Rollback routes traffic to the previous image only when schema and state remain compatible; otherwise apply a forward fix. Restoring yesterday's database to undo a release can lose legitimate customer submissions and is not routine rollback.

CD records who deployed, commit, digests, migration, time and outcome. Stop deployment on migration failure. Preserve the previous working images and manifest. Post-release checks cover synthetic enquiry persistence, staff sign-in, file authorisation, quote token expiry, outbox processing and external uptime. Monthly dependency review and expedited security patching are part of maintenance.

# 16 AWS ECS target architecture and migration

The target uses Route 53 and ACM, CloudFront for approved assets, an Application Load Balancer, ECS Fargate services for SSR/API/worker, ECR images, RDS PostgreSQL, S3, Cognito, SES, Secrets Manager and CloudWatch with OTLP-compatible tracing export. Use private subnets for tasks and database, security groups between ALB and API/SSR, and task roles for application access. Separate task execution roles from runtime roles. ALB routes public pages and API paths; staff static assets can move to S3/CloudFront under the same origin with correct SPA routing. Verify origins, cookies and callback URLs during this change.

Run at least two API tasks across availability zones when the uptime objective warrants it. SSR scales separately; worker scaling is based on queue age and backlog, not only API CPU. RDS Multi-AZ is the resilience option; a single-AZ database remains a budget compromise with an explicitly lower failure tolerance. Bound total connection pools as task counts increase. Consider RDS Proxy only when connection churn or saturation warrants its cost. Use S3 gateway endpoints and evaluate interface endpoint versus NAT costs and required third-party egress. Do not assume private subnets have free external connectivity.

ECS supports metric-based service scaling [S16]. Initial triggers to review migration are sustained latency-budget breaches after optimisation, resource use above 70 percent during ordinary peaks, inability to meet the recovery target, required multi-host availability, or operational burden exceeding budget. They are planning thresholds, not automatic migration commands. DNS migration must not change public API contracts or customer quote links.

Migration sequence: provision AWS staging with infrastructure as code; run the exact production images and tests; restore a database copy and verify counts, checksums and constraints; keep S3 object keys and provider identities stable where possible; rehearse routing and callbacks; then freeze writes during a scheduled cutover, drain workers, take a final backup, restore or complete replication, verify, switch origin routing and resume one set of workers. A maintenance-window dump/restore is the simplest first path. A low-downtime migration requires separately tested replication and a write-freeze at final synchronisation.

Never allow both old and new systems to independently issue quotes, reminders or receipts. Keep the old system read-only through the rollback observation window. DNS reversal alone is unsafe after the new database accepts writes; reconcile or replay those writes before rollback, or keep the new data tier and fix the application forward. Rotate host credentials to ECS roles, update provider callback allowlists, validate external webhooks, monitor errors and retain migration evidence. Maintain tested off-platform restore access even when managed backups are enabled.

# 17 Architecture acceptance and implementation sequence

| Test ID | Evidence required                                                                                 | Linked contracts                         |
| ------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| AAT 01  | SSR content is crawlable, missing pages return 404 and publication refresh is within five minutes | FR 01 to 09; SP 19 and 26; AR 01         |
| AAT 02  | Anonymous board-only enquiry persists once during concurrent retries and provider outage          | FR 07 and 16; SP 08 and 11; AR 03 and 08 |
| AAT 03  | Federated login alone grants no staff role; wrong issuer, token type or client is denied          | FR 23 to 24; SP 18 and 24; AR 07         |
| AAT 04  | Staff inactivity, absolute timeout and deactivation deny the next API request                     | NFR 01; SP 18 and 24; AR 07              |
| AAT 05  | Reusing upload credentials cannot mutate scanned bytes; scan failure remains quarantined          | FR 15; SP 10; AR 06 and 17               |
| AAT 06  | Quote revocation blocks active scoped sessions and proxied downloads                              | FR 19; SP 17; AR 17                      |
| AAT 07  | Trace joins request and worker without logging private payload or token                           | NFR 01 and 08; SP 23 to 25; AR 09        |
| AAT 08  | 20-user workload meets latency budget while scans and export run                                  | NFR 05; SP 28; AR 12                     |
| AAT 09  | Production deploy promotes tested digests and rollback preserves new enquiries                    | NFR 07 to 08; AR 13 to 15                |
| AAT 10  | Restore meets RPO and RTO and retains revoked-access and deletion state                           | SP 29; AR 15                             |
| AAT 11  | Forged, repeated or mismatched payment notification never creates a false receipt                 | R3 only; AR 10 and 17                    |
| AAT 12  | Mobile viewport, keyboard navigation and future client contract compatibility are verified        | FR 25; SP 27; AR 01 and 16               |

Start with the monorepo, supported-version manifest, local Compose, PostgreSQL migrations, OpenAPI and fake identity/provider adapters. Deliver the board-only vertical slice next, followed by other service forms and the staff inbox. Add private files with real scan enforcement, approvals and quotation views. Complete email delivery, observability, deployment, backups and access tests before launch. Build later communications and payment adapters behind explicit feature flags; do not let them delay the R1 core.

Done for this iteration means architecture decisions are implemented in a reproducible development preview, source requirements and specification changes are traceable, R1 tests pass, dummy values remain labelled, and deployment/recovery runbooks have been rehearsed. The next design iteration should confirm hosting regions, actual identity tenant, operating owner, chosen supported versions, telemetry placement and provider account readiness. These can use explicit placeholders during development.

# 18 Cost model risks and document alignment

No current provider prices or purchased plans are asserted. Compare recurring cost using Contabo capacity, domain, S3 storage/request/transfer, CloudFront transfer, SES delivery, Twilio messages, identity usage, monitoring retention, backups, repository plan, support time and later payment fees. Migration adds ALB, ECS task-hours, RDS storage/backup/Multi-AZ, NAT or endpoints, ECR, Secrets Manager and telemetry ingestion. Set budgets and usage alerts before activating chargeable integrations. Egress from S3 to Contabo scanning workers and repeated video transfer must be included.

Primary risks are single-host failure, a distant VPS affecting form latency, telemetry or scanning exhausting memory, federated MFA gaps, unsafe upload overwrites, unbounded provider retries, stale cached content and premature payment activation. Controls are explicit resource limits, immutable object versions, durable jobs, active staff checks, cache invalidation, synthetic failure tests and operational ownership. Reassess the architecture after the first 30 days of actual traffic and enquiry volumes.

Requirements version 1.2 adds FR 26 to FR 29 and NFR 09 to NFR 11 for this technical baseline, federation, integrations, release control, tracing, portability and migration. Specification version 1.1 adds SP 31 to SP 38 and AAT references. The changes replace the prior technology-neutral statements at the user's direction, keep board sales standalone, preserve all existing acceptance criteria and allow development with dummy business values. Live payment activation is explicitly deferred rather than silently expanding launch scope.

# 19 Official sources and verification notes

Sources reviewed on 4 October 2026. Platform capabilities below inform the design; architectural choices and numeric planning thresholds are project recommendations. Recheck versions, plan eligibility, region availability, channel rules and provider protocols at implementation and activation.

[S1] Angular. Server-side and hybrid rendering. https://angular.dev/guide/hybrid-rendering

[S2] Capacitor. Native runtime documentation and installation. https://capacitorjs.com/docs/ and https://capacitorjs.com/docs/getting-started

[S3] React Native. React fundamentals and native components. https://reactnative.dev/docs/intro-react

[S4] PostgreSQL. Licence. https://www.postgresql.org/about/licence/

[S5] AWS. Cognito third-party identity federation. https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-identity-federation.html

[S6] Spring Security. OAuth2 resource server JWT validation. https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html

[S7] AWS. Restricting CloudFront access to S3 origins. https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html

[S8] AWS. S3 presigned access. https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html

[S9] AWS. SES production access and sandbox. https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html

[S10] Twilio. WhatsApp Business Platform. https://www.twilio.com/docs/whatsapp

[S11] GitHub. Deployment environments and plan restrictions. https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments

[S12] Payfast. Custom integration and ITN guidance. https://payfast.io/integration/custom-integration/ and https://developers.payfast.co.za/docs/itn-instant-transaction-notification/

[S13] Spring Boot. Actuator metrics. https://docs.spring.io/spring-boot/reference/actuator/metrics.html

[S14] Spring Boot. Micrometer tracing and supported exporters. https://docs.spring.io/spring-boot/reference/actuator/tracing.html

[S15] GitHub. AWS OIDC deployment authentication. https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws

[S16] AWS. ECS service autoscaling. https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-auto-scaling.html
