ALTER TABLE takura.notification_outbox
  ADD COLUMN failure_code varchar(80),
  ADD COLUMN possibly_accepted boolean NOT NULL DEFAULT false,
  ADD COLUMN manual_retry_count integer NOT NULL DEFAULT 0,
  ADD COLUMN last_manual_retry_by uuid REFERENCES takura.staff_identity(id),
  ADD COLUMN last_manual_retry_reason varchar(500),
  ADD COLUMN originating_correlation_id varchar(100),
  ADD COLUMN originating_trace_id varchar(64);

CREATE TABLE takura.communication_suppression (
  id uuid PRIMARY KEY, channel varchar(20) NOT NULL, destination_hash char(64) NOT NULL,
  reason varchar(30) NOT NULL, provider_reference varchar(200), active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL, UNIQUE(channel,destination_hash),
  CHECK (reason IN ('BOUNCE','COMPLAINT','MANUAL','OPT_OUT'))
);
CREATE TABLE takura.provider_event (
  provider varchar(30) NOT NULL, provider_event_id varchar(200) NOT NULL,
  event_type varchar(50) NOT NULL, notification_id uuid REFERENCES takura.notification_outbox(id),
  received_at timestamptz NOT NULL, safe_outcome varchar(50) NOT NULL,
  PRIMARY KEY(provider,provider_event_id)
);
CREATE TABLE takura.privacy_request (
  id uuid PRIMARY KEY, request_number varchar(32) NOT NULL UNIQUE,
  enquiry_id uuid NOT NULL REFERENCES takura.enquiry(id), request_type varchar(20) NOT NULL,
  state varchar(30) NOT NULL, identity_evidence_reference varchar(200) NOT NULL,
  scope_description varchar(500) NOT NULL, requested_at timestamptz NOT NULL,
  requested_by uuid NOT NULL REFERENCES takura.staff_identity(id), approved_at timestamptz,
  approved_by uuid REFERENCES takura.staff_identity(id), actioned_at timestamptz,
  actioned_by uuid REFERENCES takura.staff_identity(id), outcome varchar(500), revision bigint NOT NULL DEFAULT 0,
  CHECK (request_type IN ('ACCESS','CORRECTION','DELETION')),
  CHECK (state IN ('OPEN','APPROVED','COMPLETED','REJECTED','BLOCKED_BY_HOLD'))
);
CREATE TABLE takura.legal_hold (
  id uuid PRIMARY KEY, enquiry_id uuid NOT NULL REFERENCES takura.enquiry(id), reason varchar(500) NOT NULL,
  active boolean NOT NULL DEFAULT true, created_by uuid NOT NULL REFERENCES takura.staff_identity(id),
  created_at timestamptz NOT NULL, released_by uuid REFERENCES takura.staff_identity(id), released_at timestamptz
);
CREATE TABLE takura.deletion_tombstone (
  id uuid PRIMARY KEY, enquiry_id uuid NOT NULL, enquiry_reference_hash char(64) NOT NULL,
  reason varchar(80) NOT NULL, deletion_version varchar(80) NOT NULL, state varchar(30) NOT NULL,
  deleted_at timestamptz NOT NULL, last_error_code varchar(80), UNIQUE(enquiry_id,deletion_version),
  CHECK (state IN ('PENDING','APPLIED','FAILED_RETRYABLE'))
);
CREATE TABLE takura.marketing_consent_event (
  id uuid PRIMARY KEY, enquiry_id uuid NOT NULL REFERENCES takura.enquiry(id), consented boolean NOT NULL,
  notice_version varchar(80) NOT NULL, evidence_source varchar(40) NOT NULL, occurred_at timestamptz NOT NULL
);
CREATE INDEX ix_outbox_backlog ON takura.notification_outbox(state,created_at) WHERE state IN ('PENDING','LEASED','DELIVERY_UNKNOWN','FAILED_REQUIRES_REVIEW');
CREATE INDEX ix_privacy_request_state ON takura.privacy_request(state,requested_at,id);
CREATE INDEX ix_legal_hold_active ON takura.legal_hold(enquiry_id) WHERE active;
CREATE INDEX ix_tombstone_replay ON takura.deletion_tombstone(state,deleted_at);
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='takura_runtime') THEN
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA takura TO takura_runtime;
END IF; END $$;
