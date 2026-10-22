# Contabo deployment target

`compose.contabo.yaml` is the production target. It publishes only the loopback gateway; the host TLS
proxy exposes 443 and redirects 80. PostgreSQL, ClamAV and management networks are internal. Images
must be release-manifest digests. Runtime roles cannot migrate; the one-shot Flyway container owns
migration credentials. Secret files live outside the checkout with mode 0400 and are mounted through
Compose secrets. Docker socket access is forbidden.

Safe operator sequence (never run from an unreviewed checkout):

```sh
git verify-tag "$RELEASE_TAG"
pwsh ./ops/release/verify-manifest.ps1 -Manifest /opt/takura/releases/release-manifest.json
docker compose --env-file /opt/takura/config/production.env -f compose.contabo.yaml pull
docker compose --env-file /opt/takura/config/production.env -f compose.contabo.yaml run --rm migrate
docker compose --env-file /opt/takura/config/production.env -f compose.contabo.yaml up -d --no-deps api worker public staff gateway
pwsh ./ops/release/smoke.ps1 -BaseUrl https://staging.example.invalid
```

Before migration, verify off-host backup age is under 24 hours and record the previous manifest. Use
an external deployment lock (`flock /var/lock/takura-deploy`) and stop on migration/readiness/smoke
failure. The TLS proxy must allow only 80/443 publicly; SSH is IP-restricted with a dedicated,
command-restricted key and pinned host key. The single VPS remains a single-host availability limit.
