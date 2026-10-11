CREATE TABLE takura.content_media_reference (
    entry_id uuid NOT NULL REFERENCES takura.content_entry(id) ON DELETE CASCADE,
    media_asset_id uuid NOT NULL REFERENCES takura.media_asset(id),
    placement varchar(40) NOT NULL,
    sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
    PRIMARY KEY (entry_id, media_asset_id, placement)
);
ALTER TABLE takura.media_asset
    ADD CONSTRAINT ck_media_visibility CHECK (visibility IN ('PUBLIC','PRIVATE')),
    ADD CONSTRAINT ck_media_scan_status CHECK (scan_status IN ('PENDING','CLEAN','REJECTED')),
    ADD CONSTRAINT ck_media_publication_clearance CHECK (publication_clearance IN ('DEMO_ONLY','PENDING','CLEARED','PRIVATE'));
CREATE INDEX ix_content_media_reference_entry ON takura.content_media_reference(entry_id, sort_order, media_asset_id);
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='takura_runtime') THEN GRANT SELECT,INSERT,UPDATE,DELETE ON takura.content_media_reference TO takura_runtime; END IF; END $$;
