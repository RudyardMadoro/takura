\set ON_ERROR_STOP on
SELECT count(*) AS enquiry_count FROM takura.enquiry;
SELECT count(*) AS quote_revision_count FROM takura.quote_revision;
SELECT count(*) AS revoked_grant_count FROM takura.customer_quote_grant WHERE revoked_at IS NOT NULL;
SELECT count(*) AS attachment_reference_count FROM takura.enquiry_attachment;
SELECT count(*) AS deletion_tombstone_count FROM takura.deletion_tombstone;
SELECT count(*) AS unapplied_tombstone_count FROM takura.deletion_tombstone WHERE state <> 'APPLIED';
SELECT version, description, success FROM flyway_schema_history ORDER BY installed_rank;
