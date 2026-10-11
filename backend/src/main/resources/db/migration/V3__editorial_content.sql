CREATE TABLE takura.content_entry (
 id uuid PRIMARY KEY, content_type varchar(20) NOT NULL CHECK(content_type IN ('PAGE','SERVICE','PROJECT','POLICY','FAQ')),
 slug varchar(100) NOT NULL, state varchar(20) NOT NULL CHECK(state IN ('DRAFT','PUBLISHED','ARCHIVED')),
 current_revision bigint NOT NULL DEFAULT 0, published_revision bigint, featured boolean NOT NULL DEFAULT false,
 category_code varchar(60), published_at timestamptz, created_at timestamptz NOT NULL,
 UNIQUE(content_type,slug)
);
CREATE TABLE takura.content_revision (
 entry_id uuid NOT NULL REFERENCES takura.content_entry(id), revision bigint NOT NULL,
 title varchar(160) NOT NULL, summary varchar(320) NOT NULL, body_html text NOT NULL,
 metadata jsonb NOT NULL DEFAULT '{}'::jsonb, changed_by uuid REFERENCES takura.staff_identity(id), changed_at timestamptz NOT NULL,
 PRIMARY KEY(entry_id,revision)
);
CREATE TABLE takura.content_slug_redirect (
 content_type varchar(20) NOT NULL, old_slug varchar(100) NOT NULL, entry_id uuid NOT NULL REFERENCES takura.content_entry(id),
 created_at timestamptz NOT NULL, PRIMARY KEY(content_type,old_slug)
);
CREATE TABLE takura.media_asset (
 id uuid PRIMARY KEY, repository_path varchar(500) NOT NULL UNIQUE, visibility varchar(20) NOT NULL,
 scan_status varchar(20) NOT NULL, publication_clearance varchar(20) NOT NULL,
 caption varchar(240) NOT NULL, alt_text varchar(240) NOT NULL, rights_reference varchar(240), demo_only boolean NOT NULL DEFAULT true
);
CREATE INDEX ix_content_public_listing ON takura.content_entry(content_type,state,featured DESC,published_at DESC,id DESC);
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='takura_runtime') THEN GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA takura TO takura_runtime; END IF; END $$;
