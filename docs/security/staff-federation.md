# Staff federation and recovery

The API accepts only signed OIDC access tokens whose issuer, audience, `client_id`, `token_use=access`, `takura.staff` scope, `auth_time`, and `amr` containing `mfa` match configuration. An ID token cannot authorize the API. Every private request after session creation also requires an opaque `X-Staff-Session` handle; only its SHA-256 hash is stored.

Access tokens and session handles remain in browser memory. Reloading or opening another tab requires interactive authentication and a new local session. No refresh token is requested or persisted. The access-token lifetime target is ten minutes, but the provider controls the actual lifetime.

## Bootstrap and recovery

Run the backend once with `takura.security.bootstrap.enabled=true`, plus an approved issuer, subject, and display label. The command refuses to run after any identity exists. It grants only staff-access and settings administration; administrator status does not grant enquiry access or quote approval. Disable bootstrap immediately afterward. Recovery requires the identity-provider operator to verify MFA and an existing active administrator to provision the replacement. The API prevents removal or deactivation of the final active administrator.

The `/api/v1/admin/users` route means federated access grants, not password or provider-account management. Deactivation and every grant change revoke active local sessions immediately.

## Provider readiness

Production must use the approved Cognito issuer and JWKS URL, verify every admitted upstream federation path enforces MFA, and capture evidence for Google Workspace or Microsoft Entra federation. Those real-provider checks require external tenant credentials and remain a production-readiness blocker. The local profile must never be enabled with the production profile.

## Permission helper

Application services call `PermissionService.require` for operation grants and `requireRecord` for record-specific paths. Controllers and hidden navigation are not authorization boundaries. Future export and download services must call the same helper before resolving data or object locations.
