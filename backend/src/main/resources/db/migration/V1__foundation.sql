CREATE SCHEMA IF NOT EXISTS takura;

CREATE TABLE takura.business_setting (
    id uuid PRIMARY KEY,
    setting_key varchar(100) NOT NULL,
    setting_value text NOT NULL,
    value_type varchar(30) NOT NULL,
    environment varchar(30) NOT NULL,
    status varchar(20) NOT NULL CHECK (status IN ('DEMO', 'PENDING', 'CONFIRMED', 'RETIRED')),
    effective_at timestamptz NOT NULL,
    revision bigint NOT NULL DEFAULT 0,
    changed_by varchar(100) NOT NULL,
    changed_at timestamptz NOT NULL,
    CONSTRAINT uq_business_setting_key_environment UNIQUE (setting_key, environment)
);

CREATE TABLE takura.service_code (
    code varchar(60) PRIMARY KEY,
    display_label varchar(120) NOT NULL,
    service_family varchar(60) NOT NULL,
    archived boolean NOT NULL DEFAULT false,
    version bigint NOT NULL DEFAULT 0
);

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'takura_runtime') THEN
        GRANT USAGE ON SCHEMA takura TO takura_runtime;
        GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA takura TO takura_runtime;
        ALTER DEFAULT PRIVILEGES IN SCHEMA takura GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO takura_runtime;
    END IF;
END $$;
