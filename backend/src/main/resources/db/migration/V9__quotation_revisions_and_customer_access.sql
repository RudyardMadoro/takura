CREATE TABLE takura.quote_group (
    id uuid PRIMARY KEY,
    enquiry_id uuid NOT NULL REFERENCES takura.enquiry(id),
    quote_number varchar(30) NOT NULL UNIQUE,
    created_by uuid NOT NULL REFERENCES takura.staff_identity(id),
    created_at timestamptz NOT NULL
);

CREATE TABLE takura.quote_revision (
    id uuid PRIMARY KEY,
    quote_group_id uuid NOT NULL REFERENCES takura.quote_group(id),
    revision_number integer NOT NULL,
    state varchar(30) NOT NULL CHECK (state IN ('DRAFT','AWAITING_APPROVAL','APPROVED','ISSUED','SUPERSEDED','EXPIRED','REVOKED','CANCELLED')),
    pdf_attachment_id uuid NOT NULL REFERENCES takura.attachment(id),
    pdf_object_version varchar(255) NOT NULL,
    pdf_checksum_sha256 varchar(64) NOT NULL,
    amount numeric(19,2) NOT NULL CHECK (amount >= 0),
    currency char(3) NOT NULL,
    tax_mode varchar(30) NOT NULL CHECK (tax_mode IN ('NOT_APPLICABLE','INCLUSIVE','EXCLUSIVE','UNCONFIRMED')),
    scope_summary varchar(5000) NOT NULL,
    material_snapshot jsonb NOT NULL,
    commercial_terms_snapshot jsonb NOT NULL,
    review_checklist jsonb NOT NULL,
    content_digest varchar(64) NOT NULL,
    configuration_version varchar(80) NOT NULL,
    expires_at timestamptz NOT NULL,
    created_by uuid NOT NULL REFERENCES takura.staff_identity(id),
    submitted_at timestamptz,
    approved_by uuid REFERENCES takura.staff_identity(id),
    approved_at timestamptz,
    approval_digest varchar(64),
    issued_by uuid REFERENCES takura.staff_identity(id),
    issued_at timestamptz,
    dispatch_state varchar(30) NOT NULL DEFAULT 'NOT_STARTED' CHECK (dispatch_state IN ('NOT_STARTED','PENDING','ACCEPTED','DELIVERY_UNKNOWN','FAILED','MANUAL_CONFIRMED')),
    superseded_by uuid REFERENCES takura.quote_revision(id),
    revoked_by uuid REFERENCES takura.staff_identity(id),
    revoked_at timestamptz,
    revocation_reason varchar(500),
    revision bigint NOT NULL DEFAULT 0,
    UNIQUE (quote_group_id, revision_number),
    CHECK ((approved_by IS NULL) = (approved_at IS NULL)),
    CHECK ((approved_by IS NULL) = (approval_digest IS NULL))
);

CREATE TABLE takura.quote_issue_command (
    idempotency_key varchar(120) PRIMARY KEY,
    quote_revision_id uuid NOT NULL REFERENCES takura.quote_revision(id),
    issued_at timestamptz NOT NULL
);

CREATE TABLE takura.customer_quote_grant (
    id uuid PRIMARY KEY,
    quote_revision_id uuid NOT NULL REFERENCES takura.quote_revision(id),
    token_hash varchar(64) NOT NULL UNIQUE,
    state varchar(20) NOT NULL CHECK (state IN ('ACTIVE','REVOKED','SUPERSEDED','EXPIRED')),
    expires_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL,
    revoked_at timestamptz,
    UNIQUE (quote_revision_id)
);

CREATE TABLE takura.quote_delivery_secret (
    id uuid PRIMARY KEY,
    quote_revision_id uuid NOT NULL UNIQUE REFERENCES takura.quote_revision(id),
    encrypted_token bytea NOT NULL,
    nonce bytea NOT NULL,
    expires_at timestamptz NOT NULL,
    destroyed_at timestamptz
);

CREATE TABLE takura.quote_access_session (
    id uuid PRIMARY KEY,
    grant_id uuid NOT NULL REFERENCES takura.customer_quote_grant(id),
    session_hash varchar(64) NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL,
    revoked_at timestamptz,
    created_at timestamptz NOT NULL
);

CREATE TABLE takura.quote_access_attempt (
    risk_hash varchar(64) NOT NULL,
    attempted_at timestamptz NOT NULL
);

CREATE TABLE takura.quote_outcome (
    id uuid PRIMARY KEY,
    quote_revision_id uuid NOT NULL REFERENCES takura.quote_revision(id),
    outcome varchar(30) NOT NULL CHECK (outcome IN ('ACCEPTED_EXTERNALLY','DECLINED','NO_RESPONSE')),
    evidence_reference varchar(500) NOT NULL,
    effective_at timestamptz NOT NULL,
    actor_identity_id uuid NOT NULL REFERENCES takura.staff_identity(id),
    recorded_at timestamptz NOT NULL,
    UNIQUE (quote_revision_id, outcome)
);

CREATE INDEX ix_quote_enquiry ON takura.quote_group(enquiry_id,created_at DESC);
CREATE INDEX ix_quote_state ON takura.quote_revision(state,expires_at,id);
CREATE INDEX ix_quote_access_session ON takura.quote_access_session(session_hash,expires_at);
CREATE INDEX ix_quote_access_attempt ON takura.quote_access_attempt(risk_hash,attempted_at DESC);

DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='takura_runtime') THEN
  GRANT SELECT,INSERT,UPDATE,DELETE ON takura.quote_group,takura.quote_revision,
    takura.quote_issue_command,takura.customer_quote_grant,takura.quote_delivery_secret,
    takura.quote_access_session,takura.quote_access_attempt,takura.quote_outcome TO takura_runtime;
END IF; END $$;
