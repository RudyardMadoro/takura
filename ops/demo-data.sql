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

-- Phase 07 synthetic operational grants. Administrator status alone is intentionally insufficient.
INSERT INTO takura.staff_grant(id,staff_identity_id,operation_code,granted_at) VALUES
 ('27000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','enquiry:assign','2026-10-05T00:00:00Z'),
 ('27000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','enquiry:operate','2026-10-05T00:00:00Z'),
 ('27000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','enquiry:manage','2026-10-05T00:00:00Z'),
 ('27000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000001','enquiry:override','2026-10-05T00:00:00Z'),
 ('27000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000001','enquiry:export','2026-10-05T00:00:00Z'),
 ('27000000-0000-4000-8000-000000000006','10000000-0000-4000-8000-000000000001','assessment:manage','2026-10-05T00:00:00Z'),
 ('27000000-0000-4000-8000-000000000007','10000000-0000-4000-8000-000000000001','assessment:override','2026-10-05T00:00:00Z'),
 ('27000000-0000-4000-8000-000000000008','10000000-0000-4000-8000-000000000001','audit:read','2026-10-05T00:00:00Z'),
 ('27000000-0000-4000-8000-000000000009','10000000-0000-4000-8000-000000000001','notifications:retry','2026-10-05T00:00:00Z'),
 ('27000000-0000-4000-8000-000000000010','10000000-0000-4000-8000-000000000001','cutting:review','2026-10-05T00:00:00Z'),
 ('27000000-0000-4000-8000-000000000011','10000000-0000-4000-8000-000000000001','production:signoff','2026-10-05T00:00:00Z'),
 ('27000000-0000-4000-8000-000000000012','10000000-0000-4000-8000-000000000001','quote:evidence','2026-10-05T00:00:00Z'),
 ('27000000-0000-4000-8000-000000000013','10000000-0000-4000-8000-000000000001','commercial:confirm','2026-10-05T00:00:00Z'),
 ('27000000-0000-4000-8000-000000000014','10000000-0000-4000-8000-000000000002','enquiry:operate','2026-10-05T00:00:00Z'),
 ('27000000-0000-4000-8000-000000000015','10000000-0000-4000-8000-000000000002','enquiry:assign','2026-10-05T00:00:00Z'),
 ('27000000-0000-4000-8000-000000000016','10000000-0000-4000-8000-000000000002','assessment:manage','2026-10-05T00:00:00Z'),
 ('27000000-0000-4000-8000-000000000017','10000000-0000-4000-8000-000000000002','cutting:review','2026-10-05T00:00:00Z')
ON CONFLICT DO NOTHING;

INSERT INTO takura.staff_grant(id,staff_identity_id,operation_code,granted_at) VALUES
 ('20000000-0000-4000-8000-000000000010','10000000-0000-4000-8000-000000000005','content:write','2026-10-05T00:00:00Z'),
 ('20000000-0000-4000-8000-000000000011','10000000-0000-4000-8000-000000000001','content:publish','2026-10-05T00:00:00Z'),
 ('20000000-0000-4000-8000-000000000012','10000000-0000-4000-8000-000000000001','content:write','2026-10-05T00:00:00Z')
ON CONFLICT DO NOTHING;

INSERT INTO takura.staff_team(staff_identity_id,team_code) VALUES
 ('10000000-0000-4000-8000-000000000001','BOARDS'),
 ('10000000-0000-4000-8000-000000000002','BOARDS'),
 ('10000000-0000-4000-8000-000000000003','PROPERTY'),
 ('10000000-0000-4000-8000-000000000004','CABINETRY'),
 ('10000000-0000-4000-8000-000000000001','GENERAL') ON CONFLICT DO NOTHING;
INSERT INTO takura.staff_role(staff_identity_id,role_code) VALUES
 ('10000000-0000-4000-8000-000000000001','SALES_COORDINATOR'),
 ('10000000-0000-4000-8000-000000000003','SALES_COORDINATOR'),
 ('10000000-0000-4000-8000-000000000004','SALES_COORDINATOR') ON CONFLICT DO NOTHING;
INSERT INTO takura.staff_grant(id,staff_identity_id,operation_code,granted_at) VALUES
 ('20000000-0000-4000-8000-000000000020','10000000-0000-4000-8000-000000000001','catalogue:write','2026-10-05T00:00:00Z'),
 ('20000000-0000-4000-8000-000000000021','10000000-0000-4000-8000-000000000001','enquiry:all:read','2026-10-05T00:00:00Z') ON CONFLICT DO NOTHING;

INSERT INTO takura.business_setting
 (id,setting_key,setting_value,value_type,environment,status,effective_at,revision,changed_by,changed_at) VALUES
 ('00000000-0000-4000-8000-000000000020','enquiry.routing_precedence','PROPERTY,CABINETRY,BOARDS,GENERAL','STRING','DEMO','DEMO','2026-10-05T00:00:00Z',0,'demo-seed','2026-10-05T00:00:00Z'),
 ('00000000-0000-4000-8000-000000000021','business_clock.timezone','Africa/Johannesburg','STRING','DEMO','DEMO','2026-10-05T00:00:00Z',0,'demo-seed','2026-10-05T00:00:00Z'),
 ('00000000-0000-4000-8000-000000000022','business_clock.open_hours','08:00-17:00 weekdays','STRING','DEMO','DEMO','2026-10-05T00:00:00Z',0,'demo-seed','2026-10-05T00:00:00Z') ON CONFLICT(setting_key,environment) DO NOTHING;

INSERT INTO takura.content_entry(id,content_type,slug,state,current_revision,published_revision,featured,category_code,published_at,created_at) VALUES
 ('30000000-0000-4000-8000-000000000001','SERVICE','property-transformation','PUBLISHED',1,1,true,'PROPERTY','2026-10-05T00:00:00Z','2026-10-05T00:00:00Z'),
 ('30000000-0000-4000-8000-000000000002','SERVICE','custom-cabinetry','PUBLISHED',1,1,true,'CABINETRY','2026-10-05T00:00:00Z','2026-10-05T00:00:00Z'),
 ('30000000-0000-4000-8000-000000000003','SERVICE','standalone-board-supply','PUBLISHED',1,1,true,'WORKSHOP','2026-10-05T00:00:00Z','2026-10-05T00:00:00Z'),
 ('30000000-0000-4000-8000-000000000011','PROJECT','compact-home-concept','PUBLISHED',1,1,true,'PROPERTY','2026-10-05T00:00:00Z','2026-10-05T00:00:00Z'),
 ('30000000-0000-4000-8000-000000000012','PROJECT','storage-renewal-concept','PUBLISHED',1,1,false,'CABINETRY','2026-10-04T00:00:00Z','2026-10-05T00:00:00Z'),
 ('30000000-0000-4000-8000-000000000013','PROJECT','workshop-material-concept','PUBLISHED',1,1,false,'WORKSHOP','2026-10-03T00:00:00Z','2026-10-05T00:00:00Z')
ON CONFLICT(content_type,slug) DO NOTHING;
INSERT INTO takura.content_revision(entry_id,revision,title,summary,body_html,metadata,changed_at) VALUES
 ('30000000-0000-4000-8000-000000000001',1,'Property transformation','Explore feasibility, constraints and an assessment-led process without promises about approvals or unit counts.','<p>Every site and approval path is different. This demonstration describes a structured feasibility conversation.</p>','{"synthetic":true}', '2026-10-05T00:00:00Z'),
 ('30000000-0000-4000-8000-000000000002',1,'Custom cabinetry','Supply-only and fix-and-supply cabinetry paths for a confirmed project brief.','<p>Choose SUPPLY_ONLY or FIX_AND_SUPPLY after scope and site constraints are understood.</p>','{"synthetic":true,"fulfilment":["SUPPLY_ONLY","FIX_AND_SUPPLY"]}', '2026-10-05T00:00:00Z'),
 ('30000000-0000-4000-8000-000000000003',1,'Standalone board supply','A prominent quotation-only material proposition. The live catalogue arrives in Phase 04.','<p>No stock, price or availability is claimed in this demonstration.</p>','{"synthetic":true,"catalogue_available":false}', '2026-10-05T00:00:00Z'),
 ('30000000-0000-4000-8000-000000000011',1,'Compact home owner-development concept','Synthetic concept, not a client commission or completed project.','<p>An owner-development concept exploring space planning in an approximate Gauteng context.</p>','{"synthetic":true,"ownership_designation":"OWNER_DEVELOPMENT_CONCEPT","approximate_location":"Gauteng concept area"}', '2026-10-05T00:00:00Z'),
 ('30000000-0000-4000-8000-000000000012',1,'Storage renewal owner-development concept','Synthetic cabinetry concept, not completed client work.','<p>A demonstration narrative for storage decisions and material coordination.</p>','{"synthetic":true,"ownership_designation":"OWNER_DEVELOPMENT_CONCEPT","approximate_location":"South Africa concept"}', '2026-10-05T00:00:00Z'),
 ('30000000-0000-4000-8000-000000000013',1,'Workshop material owner-development concept','Synthetic material-planning concept with no capacity or stock claims.','<p>A demonstration of how a future board enquiry may be positioned.</p>','{"synthetic":true,"ownership_designation":"OWNER_DEVELOPMENT_CONCEPT","approximate_location":"Workshop concept"}', '2026-10-05T00:00:00Z')
ON CONFLICT(entry_id,revision) DO NOTHING;

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
