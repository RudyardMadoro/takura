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
