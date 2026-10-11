CREATE TABLE takura.staff_identity (
    id uuid PRIMARY KEY,
    issuer varchar(500) NOT NULL,
    subject varchar(255) NOT NULL,
    display_label varchar(160) NOT NULL,
    active boolean NOT NULL DEFAULT false,
    provisioned_at timestamptz NOT NULL,
    deactivated_at timestamptz,
    revocation_boundary timestamptz NOT NULL,
    revision bigint NOT NULL DEFAULT 0,
    CONSTRAINT uq_staff_identity_subject UNIQUE (issuer, subject)
);

CREATE TABLE takura.staff_role (
    staff_identity_id uuid NOT NULL REFERENCES takura.staff_identity(id),
    role_code varchar(60) NOT NULL,
    PRIMARY KEY (staff_identity_id, role_code),
    CHECK (role_code IN ('ADMINISTRATOR','SALES_COORDINATOR','ESTIMATOR','CONTENT_EDITOR','READ_ONLY_REVIEWER'))
);

CREATE TABLE takura.staff_team (
    staff_identity_id uuid NOT NULL REFERENCES takura.staff_identity(id),
    team_code varchar(80) NOT NULL,
    PRIMARY KEY (staff_identity_id, team_code)
);

CREATE TABLE takura.staff_grant (
    id uuid PRIMARY KEY,
    staff_identity_id uuid NOT NULL REFERENCES takura.staff_identity(id),
    operation_code varchar(100) NOT NULL,
    team_code varchar(80),
    record_type varchar(80),
    record_id uuid,
    granted_at timestamptz NOT NULL,
    CONSTRAINT uq_staff_grant UNIQUE NULLS NOT DISTINCT
        (staff_identity_id, operation_code, team_code, record_type, record_id)
);

CREATE TABLE takura.staff_session (
    id uuid PRIMARY KEY,
    handle_hash varchar(64) NOT NULL UNIQUE,
    staff_identity_id uuid NOT NULL REFERENCES takura.staff_identity(id),
    issuer varchar(500) NOT NULL,
    subject varchar(255) NOT NULL,
    client_id varchar(255) NOT NULL,
    authenticated_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL,
    last_interactive_at timestamptz NOT NULL,
    absolute_expires_at timestamptz NOT NULL,
    revoked_at timestamptz,
    CONSTRAINT ck_staff_session_absolute CHECK (absolute_expires_at = authenticated_at + interval '8 hours')
);
CREATE INDEX ix_staff_session_identity ON takura.staff_session(staff_identity_id);

CREATE TABLE takura.security_audit_event (
    id uuid PRIMARY KEY,
    actor_identity_id uuid REFERENCES takura.staff_identity(id),
    target_type varchar(80) NOT NULL,
    target_id varchar(255),
    action varchar(100) NOT NULL,
    occurred_at timestamptz NOT NULL,
    correlation_id varchar(64)
);

ALTER TABLE takura.business_setting
    ADD CONSTRAINT ck_business_setting_type
    CHECK (value_type IN ('STRING','BOOLEAN','INTEGER','DECIMAL','URI','EMAIL','PHONE','DURATION'));

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'takura_runtime') THEN
        GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA takura TO takura_runtime;
    END IF;
END $$;
