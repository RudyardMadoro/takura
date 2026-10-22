# Privacy, retention and restore-deletion runbook

Staff-assisted access, correction and deletion requests require a proportionate identity-evidence reference, narrow enquiry scope and a second authorised approval. Evidence references must not contain identity-document contents. Access CSVs cover one approved enquiry and neutralise formula-leading cells.

Before deletion, check active legal holds. Deletion revokes quote grants/sessions, stops pending delivery, marks private objects for deletion, clears marketing consent and scrubs customer fields. A minimal hashed tombstone remains. Object deletion and reconciliation jobs are retryable; partial failure must remain visible.

The 12-month period for closed unsuccessful enquiries is a review-eligibility proposal, not automatic legal authority. Won-contract automatic deletion is disabled until accounting/legal retention is approved. Abandoned files retain the existing 30-day eligibility. Spam may be reviewed under the same hold-first process.

After restoring any backup, run tombstone replay before opening staff or public traffic. Reconcile database attachment references, private objects, customer grants, outbox work and provider suppression records. A restored row covered by an applied tombstone must not become visible. Record counts, failures and retry outcomes in the operational audit.

Marketing consent is separate from service communication, false by default and versioned. Withdrawal appends a consent event and activates channel suppression where applicable. Analytics remains off by default; only allowlisted, consented, non-PII events may be enabled. Refusing tracking must never block enquiry submission.
