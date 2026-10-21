ALTER TABLE takura.enquiry
    ADD COLUMN revision bigint NOT NULL DEFAULT 0,
    ADD COLUMN first_human_response_at timestamptz,
    ADD COLUMN last_activity_at timestamptz,
    ADD COLUMN quote_issued_evidence varchar(200),
    ADD COLUMN quote_dispatch_evidence varchar(200),
    ADD COLUMN commercial_confirmation_evidence varchar(200),
    ADD COLUMN operational_handover_evidence varchar(200);

CREATE TABLE takura.enquiry_activity (
    id uuid PRIMARY KEY,
    enquiry_id uuid NOT NULL REFERENCES takura.enquiry(id),
    activity_type varchar(40) NOT NULL,
    outcome varchar(40) NOT NULL,
    channel varchar(20),
    note varchar(1000),
    actor_identity_id uuid NOT NULL REFERENCES takura.staff_identity(id),
    occurred_at timestamptz NOT NULL,
    CHECK (activity_type IN ('CONTACT_ATTEMPT','HUMAN_CONTACT','NOTE','CLARIFICATION_RECEIVED','CUSTOMER_APPROVAL')),
    CHECK (outcome IN ('COMPLETED','FAILED','INFORMATION_RECEIVED','RECORDED')),
    CHECK (channel IS NULL OR channel IN ('EMAIL','CALL','WHATSAPP','IN_PERSON','REMOTE'))
);

CREATE TABLE takura.enquiry_task (
    id uuid PRIMARY KEY,
    enquiry_id uuid NOT NULL REFERENCES takura.enquiry(id),
    owner_identity_id uuid NOT NULL REFERENCES takura.staff_identity(id),
    purpose varchar(120) NOT NULL,
    due_at timestamptz NOT NULL,
    state varchar(30) NOT NULL DEFAULT 'OPEN',
    completed_at timestamptz,
    reason varchar(500),
    revision bigint NOT NULL DEFAULT 0,
    created_by uuid NOT NULL REFERENCES takura.staff_identity(id),
    created_at timestamptz NOT NULL,
    CHECK (state IN ('OPEN','COMPLETED','POSTPONED','CANCELLED')),
    CHECK ((state IN ('POSTPONED','CANCELLED')) = (reason IS NOT NULL))
);

CREATE TABLE takura.enquiry_state_transition (
    id uuid PRIMARY KEY,
    enquiry_id uuid NOT NULL REFERENCES takura.enquiry(id),
    previous_state varchar(40) NOT NULL,
    next_state varchar(40) NOT NULL,
    actor_identity_id uuid NOT NULL REFERENCES takura.staff_identity(id),
    reason varchar(500),
    evidence_reference varchar(200),
    override_used boolean NOT NULL DEFAULT false,
    occurred_at timestamptz NOT NULL
);

CREATE TABLE takura.assessment (
    id uuid PRIMARY KEY,
    enquiry_id uuid NOT NULL REFERENCES takura.enquiry(id),
    assignee_identity_id uuid NOT NULL REFERENCES takura.staff_identity(id),
    state varchar(30) NOT NULL,
    starts_at timestamptz NOT NULL,
    ends_at timestamptz NOT NULL,
    mode varchar(20) NOT NULL,
    private_location varchar(500),
    findings varchar(5000),
    private_notes varchar(5000),
    access_authorisation_confirmed boolean NOT NULL DEFAULT false,
    conflict_override boolean NOT NULL DEFAULT false,
    override_reason varchar(500),
    revision bigint NOT NULL DEFAULT 0,
    created_by uuid NOT NULL REFERENCES takura.staff_identity(id),
    created_at timestamptz NOT NULL,
    updated_at timestamptz NOT NULL,
    CHECK (state IN ('PROPOSED','CONFIRMED','COMPLETED','CANCELLED','NO_SHOW')),
    CHECK (mode IN ('REMOTE','PRIVATE_LOCATION')),
    CHECK (ends_at > starts_at),
    CHECK ((mode='PRIVATE_LOCATION') = (private_location IS NOT NULL)),
    CHECK (NOT conflict_override OR override_reason IS NOT NULL)
);

CREATE TABLE takura.cutting_specification_review (
    enquiry_id uuid PRIMARY KEY REFERENCES takura.enquiry(id),
    state varchar(40) NOT NULL,
    attachment_id uuid REFERENCES takura.attachment(id),
    attachment_version varchar(200),
    specification_revision bigint NOT NULL,
    confirmation_snapshot jsonb NOT NULL,
    customer_approval_evidence varchar(200),
    reviewed_by uuid NOT NULL REFERENCES takura.staff_identity(id),
    reviewed_at timestamptz NOT NULL,
    revision bigint NOT NULL DEFAULT 0,
    CHECK (state IN ('LIST_REVIEW_PENDING','NEEDS_CLARIFICATION','SPECIFICATIONS_CONFIRMED'))
);

CREATE TABLE takura.production_signoff (
    id uuid PRIMARY KEY,
    enquiry_id uuid NOT NULL REFERENCES takura.enquiry(id),
    specification_revision bigint NOT NULL,
    attachment_version varchar(200),
    customer_approval_evidence varchar(200) NOT NULL,
    actor_identity_id uuid NOT NULL REFERENCES takura.staff_identity(id),
    reason varchar(500) NOT NULL,
    signed_at timestamptz NOT NULL,
    UNIQUE (enquiry_id, specification_revision)
);

CREATE TABLE takura.operational_audit (
    id uuid PRIMARY KEY,
    actor_identity_id uuid REFERENCES takura.staff_identity(id),
    target_type varchar(50) NOT NULL,
    target_id uuid,
    action varchar(80) NOT NULL,
    outcome varchar(40) NOT NULL,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    occurred_at timestamptz NOT NULL
);

CREATE INDEX ix_enquiry_dashboard ON takura.enquiry(team_code,state,owner_identity_id,first_response_due_at,created_at DESC,id DESC);
CREATE INDEX ix_enquiry_area_created ON takura.enquiry(town_or_suburb,created_at DESC,id DESC);
CREATE INDEX ix_activity_enquiry_time ON takura.enquiry_activity(enquiry_id,occurred_at DESC);
CREATE INDEX ix_task_owner_due ON takura.enquiry_task(owner_identity_id,state,due_at,id);
CREATE INDEX ix_task_enquiry_due ON takura.enquiry_task(enquiry_id,state,due_at,id);
CREATE INDEX ix_assessment_assignee_time ON takura.assessment(assignee_identity_id,state,starts_at,ends_at);
CREATE INDEX ix_assessment_enquiry ON takura.assessment(enquiry_id,starts_at DESC);
CREATE INDEX ix_operational_audit_target ON takura.operational_audit(target_type,target_id,occurred_at DESC);

CREATE OR REPLACE FUNCTION takura.flag_deactivated_staff_work() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.active AND NOT NEW.active THEN
    UPDATE takura.enquiry
       SET owner_identity_id=NULL, revision=revision+1
     WHERE owner_identity_id=NEW.id AND state NOT IN ('CLOSED','LOST','SPAM');
    UPDATE takura.enquiry_task
       SET state='POSTPONED', reason='OWNER_DEACTIVATED_REVIEW_REQUIRED', revision=revision+1
     WHERE owner_identity_id=NEW.id AND state='OPEN';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_staff_deactivation_work
AFTER UPDATE OF active ON takura.staff_identity
FOR EACH ROW EXECUTE FUNCTION takura.flag_deactivated_staff_work();

DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='takura_runtime') THEN
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA takura TO takura_runtime;
END IF; END $$;
