CREATE TABLE takura.upload_session (
    id uuid PRIMARY KEY,
    capability_hash varchar(64) NOT NULL UNIQUE,
    purpose varchar(20) NOT NULL CHECK (purpose IN ('CUSTOMER_ATTACHMENT','STAFF_MEDIA')),
    owner_identity_id uuid REFERENCES takura.staff_identity(id),
    risk_hash varchar(64) NOT NULL,
    state varchar(20) NOT NULL CHECK (state IN ('ACTIVE','EXPIRED','COMPLETED')),
    allocated_files integer NOT NULL DEFAULT 0 CHECK (allocated_files BETWEEN 0 AND 5),
    allocated_bytes bigint NOT NULL DEFAULT 0 CHECK (allocated_bytes BETWEEN 0 AND 104857600),
    created_at timestamptz NOT NULL,
    expires_at timestamptz NOT NULL,
    CHECK (expires_at = created_at + interval '60 minutes')
);

CREATE TABLE takura.attachment (
    id uuid PRIMARY KEY,
    upload_session_id uuid NOT NULL REFERENCES takura.upload_session(id),
    enquiry_id uuid REFERENCES takura.enquiry(id),
    safe_display_name varchar(160) NOT NULL,
    extension varchar(10) NOT NULL,
    declared_content_type varchar(100) NOT NULL,
    expected_bytes bigint NOT NULL CHECK (expected_bytes BETWEEN 1 AND 104857600),
    expected_checksum_sha256 varchar(64) NOT NULL,
    staging_key varchar(500) NOT NULL UNIQUE,
    staging_version varchar(255),
    private_key varchar(500),
    private_version varchar(255),
    verified_checksum_sha256 varchar(64),
    state varchar(24) NOT NULL CHECK (state IN ('CREATED','UPLOADING','VALIDATING','SCAN_PENDING','CLEAN','REJECTED','FAILED','EXPIRED','DELETION_PENDING','DELETED')),
    rejection_code varchar(80),
    created_at timestamptz NOT NULL,
    completed_at timestamptz,
    scan_completed_at timestamptz,
    cleanup_eligible_at timestamptz NOT NULL,
    revision bigint NOT NULL DEFAULT 0,
    UNIQUE(upload_session_id,id)
);

CREATE TABLE takura.attachment_scan_job (
    attachment_id uuid PRIMARY KEY REFERENCES takura.attachment(id),
    state varchar(24) NOT NULL CHECK (state IN ('PENDING','LEASED','COMPLETED','FAILED_REQUIRES_REVIEW')),
    attempts integer NOT NULL DEFAULT 0,
    next_attempt_at timestamptz NOT NULL,
    lease_until timestamptz,
    leased_by varchar(100),
    last_result varchar(80),
    created_at timestamptz NOT NULL,
    completed_at timestamptz
);

CREATE TABLE takura.enquiry_attachment (
    enquiry_id uuid NOT NULL REFERENCES takura.enquiry(id),
    attachment_id uuid NOT NULL UNIQUE REFERENCES takura.attachment(id),
    associated_at timestamptz NOT NULL,
    PRIMARY KEY(enquiry_id,attachment_id)
);

ALTER TABLE takura.media_asset
    ADD COLUMN source_attachment_id uuid REFERENCES takura.attachment(id),
    ADD COLUMN media_type varchar(20) NOT NULL DEFAULT 'IMAGE' CHECK (media_type IN ('IMAGE','VIDEO')),
    ADD COLUMN stage varchar(20) CHECK (stage IN ('BEFORE','DURING','AFTER','DETAIL','CONCEPT')),
    ADD COLUMN rights_status varchar(24) NOT NULL DEFAULT 'PENDING' CHECK (rights_status IN ('PENDING','CONFIRMED','REJECTED')),
    ADD COLUMN width_px integer,
    ADD COLUMN height_px integer,
    ADD COLUMN duration_seconds integer,
    ADD COLUMN poster_asset_id uuid REFERENCES takura.media_asset(id),
    ADD COLUMN captions_reference varchar(500),
    ADD COLUMN revision bigint NOT NULL DEFAULT 0;

CREATE TABLE takura.media_derivative (
    id uuid PRIMARY KEY,
    media_asset_id uuid NOT NULL REFERENCES takura.media_asset(id) ON DELETE CASCADE,
    object_key varchar(500) NOT NULL UNIQUE,
    object_version varchar(255) NOT NULL,
    checksum_sha256 varchar(64) NOT NULL,
    content_type varchar(100) NOT NULL,
    width_px integer,
    height_px integer,
    public_approved boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL
);

CREATE TABLE takura.storage_audit_event (
    id uuid PRIMARY KEY,
    actor_identity_id uuid REFERENCES takura.staff_identity(id),
    attachment_id uuid REFERENCES takura.attachment(id),
    action varchar(80) NOT NULL,
    outcome varchar(40) NOT NULL,
    occurred_at timestamptz NOT NULL,
    correlation_id varchar(64)
);

CREATE INDEX ix_upload_session_risk ON takura.upload_session(risk_hash,created_at DESC);
CREATE INDEX ix_attachment_cleanup ON takura.attachment(state,cleanup_eligible_at);
CREATE INDEX ix_attachment_enquiry ON takura.attachment(enquiry_id,state);
CREATE INDEX ix_scan_ready ON takura.attachment_scan_job(state,next_attempt_at,created_at);
CREATE INDEX ix_media_library ON takura.media_asset(scan_status,publication_clearance,rights_status);

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='takura_runtime') THEN
        GRANT SELECT,INSERT,UPDATE,DELETE ON takura.upload_session,takura.attachment,
            takura.attachment_scan_job,takura.enquiry_attachment,takura.media_derivative,
            takura.storage_audit_event TO takura_runtime;
    END IF;
END $$;
