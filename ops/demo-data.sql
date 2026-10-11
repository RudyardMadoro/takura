INSERT INTO takura.business_setting
    (id, setting_key, setting_value, value_type, environment, status, effective_at, revision, changed_by, changed_at)
VALUES
    ('00000000-0000-4000-8000-000000000001', 'business.display_name', 'Example Property Transformation', 'STRING', 'DEMO', 'DEMO', '2026-10-05T00:00:00Z', 0, 'demo-seed', '2026-10-05T00:00:00Z'),
    ('00000000-0000-4000-8000-000000000002', 'contact.email', 'contact@example.invalid', 'EMAIL', 'DEMO', 'PENDING', '2026-10-05T00:00:00Z', 0, 'demo-seed', '2026-10-05T00:00:00Z'),
    ('00000000-0000-4000-8000-000000000003', 'contact.phone', '', 'PHONE', 'DEMO', 'PENDING', '2026-10-05T00:00:00Z', 0, 'demo-seed', '2026-10-05T00:00:00Z')
ON CONFLICT (setting_key, environment) DO NOTHING;

INSERT INTO takura.service_code (code, display_label, service_family, archived)
VALUES
    ('PROPERTY_TRANSFORMATION', 'Property transformation', 'PROPERTY', false),
    ('CONSTRUCTION', 'Construction', 'PROPERTY', false),
    ('RENOVATION', 'Renovation', 'PROPERTY', false),
    ('EXTENSION', 'Extension', 'PROPERTY', false),
    ('MAINTENANCE', 'Maintenance', 'PROPERTY', false),
    ('INTERIORS', 'Interiors', 'PROPERTY', false),
    ('CABINETRY', 'Cabinetry', 'CABINETRY', false),
    ('BOARD_SALES', 'Board sales', 'WORKSHOP', false),
    ('BOARD_CUTTING', 'Board cutting', 'WORKSHOP', false),
    ('HARDWARE', 'Supporting hardware', 'MATERIALS', false)
ON CONFLICT (code) DO NOTHING;

INSERT INTO takura.staff_identity(id, issuer, subject, display_label, active, provisioned_at, revocation_boundary)
VALUES
 ('10000000-0000-4000-8000-000000000001','http://127.0.0.1:8080/dev-oidc','demo-owner','Demo Owner',true,'2026-10-05T00:00:00Z','2026-10-05T00:00:00Z'),
 ('10000000-0000-4000-8000-000000000002','http://127.0.0.1:8080/dev-oidc','demo-coordinator','Demo Coordinator',true,'2026-10-05T00:00:00Z','2026-10-05T00:00:00Z'),
 ('10000000-0000-4000-8000-000000000003','http://127.0.0.1:8080/dev-oidc','demo-estimator','Demo Estimator',true,'2026-10-05T00:00:00Z','2026-10-05T00:00:00Z'),
 ('10000000-0000-4000-8000-000000000004','http://127.0.0.1:8080/dev-oidc','demo-approver','Demo Approver',true,'2026-10-05T00:00:00Z','2026-10-05T00:00:00Z'),
 ('10000000-0000-4000-8000-000000000005','http://127.0.0.1:8080/dev-oidc','demo-editor','Demo Editor',true,'2026-10-05T00:00:00Z','2026-10-05T00:00:00Z'),
 ('10000000-0000-4000-8000-000000000006','http://127.0.0.1:8080/dev-oidc','demo-reviewer','Demo Reviewer',true,'2026-10-05T00:00:00Z','2026-10-05T00:00:00Z')
ON CONFLICT (issuer,subject) DO NOTHING;

INSERT INTO takura.staff_role(staff_identity_id,role_code) VALUES
 ('10000000-0000-4000-8000-000000000001','ADMINISTRATOR'),('10000000-0000-4000-8000-000000000002','SALES_COORDINATOR'),
 ('10000000-0000-4000-8000-000000000003','ESTIMATOR'),('10000000-0000-4000-8000-000000000004','READ_ONLY_REVIEWER'),
 ('10000000-0000-4000-8000-000000000005','CONTENT_EDITOR'),('10000000-0000-4000-8000-000000000006','READ_ONLY_REVIEWER')
ON CONFLICT DO NOTHING;

INSERT INTO takura.staff_grant(id,staff_identity_id,operation_code,granted_at) VALUES
 ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','staff_access:read','2026-10-05T00:00:00Z'),
 ('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','staff_access:write','2026-10-05T00:00:00Z'),
 ('20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','settings:read','2026-10-05T00:00:00Z'),
 ('20000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000001','settings:write','2026-10-05T00:00:00Z'),
 ('20000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000002','enquiry:assigned:read','2026-10-05T00:00:00Z'),
 ('20000000-0000-4000-8000-000000000006','10000000-0000-4000-8000-000000000003','quote:draft','2026-10-05T00:00:00Z'),
 ('20000000-0000-4000-8000-000000000007','10000000-0000-4000-8000-000000000004','quote:approve','2026-10-05T00:00:00Z'),
 ('20000000-0000-4000-8000-000000000008','10000000-0000-4000-8000-000000000005','content:write','2026-10-05T00:00:00Z'),
 ('20000000-0000-4000-8000-000000000009','10000000-0000-4000-8000-000000000006','record:granted:read','2026-10-05T00:00:00Z')
ON CONFLICT DO NOTHING;
