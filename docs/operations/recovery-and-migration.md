# Recovery and migration runbook

Daily `pg_dump` custom-format backups are encrypted with an offline-owned age recipient and copied to a
versioned off-host private bucket. S3 private objects, exact object versions/checksums, configuration and
release manifest form one recovery inventory. Database-only or VPS-snapshot-only recovery is incomplete.
Restrict backup readers, enable object lock where approved, alert at 24 hours, and rehearse quarterly.

Restore only to an isolated `restore-rehearsal` environment. Run `restore-rehearsal.ps1`, reconcile object
versions, then validate enquiry/quote counts, revoked grants, file associations, constraints and deletion
tombstone replay before allowing network exposure. Record backup creation, incident start, restore start
and validation completion; RPO is at most 24 hours and RTO at most eight business hours. Partial failures
remain isolated and resumable.

AWS cutover: stop submissions, drain and stop old workers, take final encrypted backup, restore or finish
tested replication, compare counts/checksums/constraints and object keys, start exactly one new worker set,
then reopen writes. Keep old service read-only. After any new AWS write, DNS reversal is not rollback:
reconcile/replay new rows and objects or fix forward. Quote URLs/callbacks retain stable public hostnames.

Migration is justified by measured sustained resource pressure, recovery/availability requirements,
latency geography or operating burden—not fashion. Real RDS restore/replication, ECS task behavior,
CloudFront OAC, Cognito/SES callbacks and cost remain untested without an approved staging account.
