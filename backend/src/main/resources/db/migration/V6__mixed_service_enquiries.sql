ALTER TABLE takura.enquiry
    ADD COLUMN area_review_required boolean NOT NULL DEFAULT false,
    ADD COLUMN first_response_due_at timestamptz,
    ADD COLUMN business_clock_rule_version varchar(80),
    ADD COLUMN budget_band varchar(80),
    ADD COLUMN budget_currency char(3),
    ADD COLUMN desired_start varchar(80);

CREATE TABLE takura.enquiry_service_detail (
    enquiry_id uuid NOT NULL REFERENCES takura.enquiry(id),
    service_code varchar(60) NOT NULL REFERENCES takura.service_code(code),
    schema_version integer NOT NULL,
    detail_snapshot jsonb NOT NULL,
    PRIMARY KEY (enquiry_id, service_code),
    CHECK (schema_version > 0)
);

DO $$ DECLARE constraint_name text; BEGIN
  SELECT conname INTO constraint_name FROM pg_constraint
  WHERE conrelid='takura.enquiry_request_line'::regclass AND pg_get_constraintdef(oid) LIKE '%fulfilment%';
  IF constraint_name IS NOT NULL THEN EXECUTE format('ALTER TABLE takura.enquiry_request_line DROP CONSTRAINT %I',constraint_name); END IF;
END $$;
ALTER TABLE takura.enquiry_request_line ADD CONSTRAINT ck_request_line_fulfilment
    CHECK ((unit='SHEET' AND fulfilment='FULL_SHEET' AND quantity BETWEEN 1 AND 9999)
        OR (fulfilment='CUT_TO_SIZE' AND quantity BETWEEN 1 AND 9999));

CREATE INDEX ix_enquiry_response_due ON takura.enquiry(first_response_due_at, state);
CREATE INDEX ix_enquiry_service_code ON takura.enquiry_service_detail(service_code, enquiry_id);

DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='takura_runtime') THEN
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA takura TO takura_runtime;
END IF; END $$;
