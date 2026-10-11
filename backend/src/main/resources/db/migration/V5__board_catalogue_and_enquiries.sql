CREATE TABLE takura.board_product (
    id uuid PRIMARY KEY,
    slug varchar(100) NOT NULL UNIQUE,
    name varchar(160) NOT NULL,
    description varchar(1000) NOT NULL,
    enabled boolean NOT NULL DEFAULT false,
    archived boolean NOT NULL DEFAULT false,
    current_revision bigint NOT NULL DEFAULT 1,
    published_revision bigint,
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL,
    CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    CHECK (NOT archived OR NOT enabled)
);

CREATE TABLE takura.board_variant (
    id uuid PRIMARY KEY,
    product_id uuid NOT NULL REFERENCES takura.board_product(id),
    sku varchar(80) NOT NULL UNIQUE,
    internal_code varchar(80) NOT NULL UNIQUE,
    enabled boolean NOT NULL DEFAULT false,
    archived boolean NOT NULL DEFAULT false,
    current_revision bigint NOT NULL DEFAULT 1,
    published_revision bigint,
    updated_at timestamptz NOT NULL,
    CHECK (NOT archived OR NOT enabled)
);

CREATE TABLE takura.board_variant_revision (
    variant_id uuid NOT NULL REFERENCES takura.board_variant(id),
    revision bigint NOT NULL,
    material_type varchar(40) NOT NULL,
    finish varchar(80) NOT NULL,
    thickness_mm numeric(8,2) NOT NULL,
    sheet_length_mm integer NOT NULL,
    sheet_width_mm integer NOT NULL,
    unit varchar(20) NOT NULL,
    availability_wording varchar(240) NOT NULL,
    collection_delivery_wording varchar(300) NOT NULL,
    changed_by uuid REFERENCES takura.staff_identity(id),
    changed_at timestamptz NOT NULL,
    PRIMARY KEY (variant_id, revision),
    CHECK (material_type IN ('MELAMINE','MDF','PLYWOOD','OTHER')),
    CHECK (length(finish) BETWEEN 2 AND 80),
    CHECK (thickness_mm > 0 AND sheet_length_mm > 0 AND sheet_width_mm > 0),
    CHECK (unit = 'SHEET')
);

CREATE INDEX ix_board_variant_filters ON takura.board_variant(enabled, archived, product_id);
CREATE INDEX ix_board_variant_revision_filters ON takura.board_variant_revision(material_type, finish, thickness_mm, sheet_length_mm, sheet_width_mm);

CREATE TABLE takura.hardware_item (
    id uuid PRIMARY KEY,
    slug varchar(100) NOT NULL UNIQUE,
    name varchar(160) NOT NULL,
    category varchar(80) NOT NULL,
    description varchar(1000) NOT NULL,
    unit varchar(20) NOT NULL,
    availability_wording varchar(240) NOT NULL,
    enabled boolean NOT NULL DEFAULT false,
    archived boolean NOT NULL DEFAULT false,
    revision bigint NOT NULL DEFAULT 1,
    updated_at timestamptz NOT NULL,
    CHECK (unit IN ('EACH','PACK','LITRE','METRE')),
    CHECK (NOT archived OR NOT enabled)
);

CREATE TABLE takura.enquiry (
    id uuid PRIMARY KEY,
    reference varchar(32) NOT NULL UNIQUE,
    state varchar(40) NOT NULL DEFAULT 'NEW',
    team_code varchar(80) NOT NULL,
    owner_identity_id uuid REFERENCES takura.staff_identity(id),
    full_name varchar(120) NOT NULL,
    email varchar(254),
    phone varchar(80),
    preferred_contact varchar(20) NOT NULL,
    country_code char(2) NOT NULL,
    town_or_suburb varchar(120) NOT NULL,
    description varchar(5000) NOT NULL,
    privacy_notice_version varchar(80) NOT NULL,
    privacy_acknowledged_at timestamptz NOT NULL,
    marketing_opt_in boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL,
    CHECK (preferred_contact IN ('EMAIL','CALL','WHATSAPP')),
    CHECK ((preferred_contact = 'EMAIL' AND email IS NOT NULL) OR
           (preferred_contact IN ('CALL','WHATSAPP') AND phone IS NOT NULL))
);

CREATE TABLE takura.enquiry_request_line (
    enquiry_id uuid NOT NULL REFERENCES takura.enquiry(id),
    line_number smallint NOT NULL,
    variant_id uuid REFERENCES takura.board_variant(id),
    requested_specification varchar(500),
    quantity integer NOT NULL,
    unit varchar(20) NOT NULL,
    fulfilment varchar(30) NOT NULL,
    collection_preference varchar(20) NOT NULL,
    substitutes_allowed varchar(20) NOT NULL,
    specification_snapshot jsonb NOT NULL,
    PRIMARY KEY (enquiry_id, line_number),
    CHECK (line_number BETWEEN 1 AND 10),
    CHECK (quantity BETWEEN 1 AND 9999),
    CHECK (unit = 'SHEET' AND fulfilment = 'FULL_SHEET'),
    CHECK (collection_preference IN ('COLLECTION','DELIVERY','UNDECIDED')),
    CHECK (substitutes_allowed IN ('YES','NO','DISCUSS')),
    CHECK ((variant_id IS NOT NULL) <> (requested_specification IS NOT NULL))
);

CREATE TABLE takura.enquiry_record_grant (
    enquiry_id uuid NOT NULL REFERENCES takura.enquiry(id),
    staff_identity_id uuid NOT NULL REFERENCES takura.staff_identity(id),
    granted_at timestamptz NOT NULL,
    PRIMARY KEY (enquiry_id, staff_identity_id)
);

CREATE SEQUENCE takura.enquiry_reference_sequence START WITH 1000;
CREATE INDEX ix_enquiry_team_state_created ON takura.enquiry(team_code, state, created_at DESC, id DESC);
CREATE INDEX ix_enquiry_owner_created ON takura.enquiry(owner_identity_id, created_at DESC, id DESC);

CREATE TABLE takura.idempotency_record (
    namespace varchar(80) NOT NULL,
    key_hash char(64) NOT NULL,
    request_digest char(64) NOT NULL,
    enquiry_id uuid NOT NULL REFERENCES takura.enquiry(id),
    response_payload jsonb NOT NULL,
    created_at timestamptz NOT NULL,
    expires_at timestamptz NOT NULL,
    PRIMARY KEY (namespace, key_hash)
);

CREATE TABLE takura.notification_outbox (
    id uuid PRIMARY KEY,
    event_type varchar(80) NOT NULL,
    aggregate_id uuid NOT NULL,
    semantic_key varchar(180) NOT NULL UNIQUE,
    payload jsonb NOT NULL,
    state varchar(40) NOT NULL DEFAULT 'PENDING',
    attempts integer NOT NULL DEFAULT 0,
    next_attempt_at timestamptz NOT NULL,
    lease_until timestamptz,
    leased_by varchar(100),
    provider_reference varchar(200),
    trace_context varchar(100),
    created_at timestamptz NOT NULL,
    completed_at timestamptz,
    CHECK (state IN ('PENDING','LEASED','DELIVERED','DELIVERY_UNKNOWN','FAILED_REQUIRES_REVIEW'))
);
CREATE INDEX ix_outbox_ready ON takura.notification_outbox(state, next_attempt_at, lease_until);

CREATE TABLE takura.enquiry_abuse_bucket (
    risk_hash char(64) NOT NULL,
    window_start timestamptz NOT NULL,
    submission_count integer NOT NULL,
    PRIMARY KEY (risk_hash, window_start)
);

INSERT INTO takura.board_product(id,slug,name,description,enabled,current_revision,published_revision,created_at,updated_at) VALUES
 ('40000000-0000-4000-8000-000000000001','white-melamine-board','White melamine board','Visibly synthetic board fixture for full-sheet quotation.',true,1,1,'2026-10-05T00:00:00Z','2026-10-05T00:00:00Z'),
 ('40000000-0000-4000-8000-000000000002','raw-mdf-board','Raw MDF board','Visibly synthetic raw MDF fixture for quotation.',true,1,1,'2026-10-05T00:00:00Z','2026-10-05T00:00:00Z'),
 ('40000000-0000-4000-8000-000000000003','raw-plywood-board','Raw plywood board','Visibly synthetic plywood fixture for specification clarification.',true,1,1,'2026-10-05T00:00:00Z','2026-10-05T00:00:00Z');
INSERT INTO takura.board_variant(id,product_id,sku,internal_code,enabled,current_revision,published_revision,updated_at) VALUES
 ('41000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001','DEMO-B01','DEMO-B01',true,1,1,'2026-10-05T00:00:00Z'),
 ('41000000-0000-4000-8000-000000000002','40000000-0000-4000-8000-000000000002','DEMO-B02','DEMO-B02',true,1,1,'2026-10-05T00:00:00Z'),
 ('41000000-0000-4000-8000-000000000003','40000000-0000-4000-8000-000000000003','DEMO-B03','DEMO-B03',true,1,1,'2026-10-05T00:00:00Z');
INSERT INTO takura.board_variant_revision(variant_id,revision,material_type,finish,thickness_mm,sheet_length_mm,sheet_width_mm,unit,availability_wording,collection_delivery_wording,changed_at) VALUES
 ('41000000-0000-4000-8000-000000000001',1,'MELAMINE','WHITE',16,2440,1220,'SHEET','Sourced on request; no stock level is claimed.','Collection or delivery expectations are confirmed during quotation.','2026-10-05T00:00:00Z'),
 ('41000000-0000-4000-8000-000000000002',1,'MDF','RAW',18,2440,1220,'SHEET','Sourced on request; no stock level is claimed.','Collection or delivery expectations are confirmed during quotation.','2026-10-05T00:00:00Z'),
 ('41000000-0000-4000-8000-000000000003',1,'PLYWOOD','RAW',12,2440,1220,'SHEET','Sourced on request; specification needs staff confirmation.','Collection or delivery expectations are confirmed during quotation.','2026-10-05T00:00:00Z');
INSERT INTO takura.hardware_item(id,slug,name,category,description,unit,availability_wording,enabled,revision,updated_at) VALUES
 ('42000000-0000-4000-8000-000000000001','example-board-paint','Example board paint','FINISHING_SUPPLY','A synthetic paint supply item, not painting labour.','LITRE','Sourced on request; pack and colour are confirmed during quotation.',true,1,'2026-10-05T00:00:00Z');

DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='takura_runtime') THEN
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA takura TO takura_runtime;
  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA takura TO takura_runtime;
END IF; END $$;
