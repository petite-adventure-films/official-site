-- Rebuild the CHECK constraint, preserving all rows and dependent triggers.
PRAGMA defer_foreign_keys = ON;
DROP TRIGGER validate_duplicate_source;
DROP TRIGGER apply_draft_operation;
DROP TRIGGER validate_publication_operation;
DROP TRIGGER immutable_publication_snapshot;
DROP TRIGGER finalize_publication;
DROP TRIGGER apply_restore;
DROP TRIGGER validate_publication_url;
DROP TRIGGER immutable_publication_routes;
DROP TRIGGER validate_publication_url_retry;
DROP TRIGGER finalize_publication_url;
CREATE TABLE content_drafts_blog (
  id TEXT PRIMARY KEY,
  version INTEGER NOT NULL CHECK (version >= 1),
  type TEXT NOT NULL CHECK (type IN ('event', 'blog')),
  payload_schema_version TEXT NOT NULL,
  payload TEXT NOT NULL CHECK (json_valid(payload)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  copied_from_id TEXT
);
INSERT INTO content_drafts_blog SELECT * FROM content_drafts;
DROP TABLE content_drafts;
ALTER TABLE content_drafts_blog RENAME TO content_drafts;
CREATE INDEX content_drafts_created ON content_drafts(created_at DESC, id DESC);
CREATE INDEX content_drafts_type_created ON content_drafts(type, created_at DESC, id DESC);
CREATE TRIGGER validate_duplicate_source BEFORE INSERT ON draft_operations
WHEN NEW.source_id IS NOT NULL
BEGIN
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM content_drafts WHERE id = NEW.source_id AND version = NEW.expected_version
  ) THEN RAISE(ABORT, 'draft_version_conflict') END;
END;
CREATE TRIGGER apply_draft_operation AFTER INSERT ON draft_operations
BEGIN
  INSERT INTO content_drafts (
    id, version, type, payload_schema_version, payload,
    created_at, updated_at, created_by, updated_by, copied_from_id
  ) SELECT NEW.content_id, 1, json_extract(NEW.response, '$.type'), json_extract(NEW.response, '$.payloadSchemaVersion'),
    json_extract(NEW.response, '$.payload'), NEW.created_at, NEW.created_at, NEW.actor_id, NEW.actor_id, NEW.source_id
    WHERE NEW.kind = 'create';

  UPDATE content_drafts SET
    version = version + 1,
    payload = json_extract(NEW.response, '$.payload'),
    updated_at = NEW.created_at,
    updated_by = NEW.actor_id
    WHERE NEW.kind = 'update' AND id = NEW.content_id AND version = NEW.expected_version;

  SELECT CASE WHEN NEW.kind = 'update' AND changes() != 1
    THEN RAISE(ABORT, 'draft_version_conflict') END;
END;
CREATE TRIGGER validate_publication_operation BEFORE INSERT ON publication_operations BEGIN
  SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM content_drafts WHERE id = NEW.content_id AND version = NEW.draft_version)
    THEN RAISE(ABORT, 'draft_version_conflict') END;
  SELECT CASE WHEN COALESCE((SELECT version FROM publication_state WHERE content_id = NEW.content_id), 0) != NEW.expected_publication_version
    THEN RAISE(ABORT, 'publication_version_conflict') END;
END;
CREATE TRIGGER immutable_publication_snapshot BEFORE UPDATE ON publication_operations
WHEN NEW.id != OLD.id OR NEW.actor_id != OLD.actor_id OR NEW.operation_id != OLD.operation_id
  OR NEW.fingerprint != OLD.fingerprint OR NEW.content_id != OLD.content_id
  OR NEW.draft_version != OLD.draft_version OR NEW.expected_publication_version != OLD.expected_publication_version
  OR NEW.content_hash != OLD.content_hash
  OR (NEW.payload IS NOT OLD.payload AND NOT (NEW.payload IS NULL AND NEW.state IN ('succeeded', 'noop')))
  OR (NEW.draft_snapshot IS NOT OLD.draft_snapshot AND NOT (NEW.draft_snapshot IS NULL AND NEW.state IN ('succeeded', 'noop')))
BEGIN SELECT RAISE(ABORT, 'immutable_publication_snapshot'); END;
CREATE TRIGGER finalize_publication AFTER UPDATE OF state ON publication_operations
WHEN NEW.state = 'succeeded' AND OLD.state IN ('delivering', 'unknown') BEGIN
  SELECT CASE WHEN NEW.receipt IS NULL OR NEW.revision_id IS NULL OR NEW.completed_at IS NULL
    THEN RAISE(ABORT, 'missing_confirmation') END;
  SELECT CASE WHEN COALESCE((SELECT version FROM publication_state WHERE content_id = NEW.content_id), 0) != NEW.expected_publication_version
    THEN RAISE(ABORT, 'publication_version_conflict') END;
  INSERT INTO publication_revisions (id, content_id, version, payload, content_hash, published_at, published_by, published_name)
    VALUES (NEW.revision_id, NEW.content_id, NEW.expected_publication_version + 1, OLD.payload, NEW.content_hash, NEW.completed_at, NEW.actor_id, NEW.actor_name);
  INSERT INTO publication_state (content_id, version, revision_id, content_hash)
    VALUES (NEW.content_id, NEW.expected_publication_version + 1, NEW.revision_id, NEW.content_hash)
    ON CONFLICT(content_id) DO UPDATE SET version = excluded.version, revision_id = excluded.revision_id, content_hash = excluded.content_hash;
  DELETE FROM publication_revisions WHERE content_id = NEW.content_id AND id NOT IN
    (SELECT id FROM publication_revisions WHERE content_id = NEW.content_id ORDER BY version DESC LIMIT 3);
END;
CREATE TRIGGER apply_restore AFTER INSERT ON restore_operations BEGIN
  SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM content_drafts WHERE id = NEW.content_id AND version = NEW.expected_version)
    THEN RAISE(ABORT, 'draft_version_conflict') END;
  SELECT CASE WHEN NEW.source_kind = 'publication' AND NOT EXISTS
    (SELECT 1 FROM publication_revisions WHERE id = NEW.source_id AND content_id = NEW.content_id)
    THEN RAISE(ABORT, 'restore_source_missing') END;
  SELECT CASE WHEN NEW.source_kind = 'protectedDraft' AND NOT EXISTS
    (SELECT 1 FROM protected_drafts WHERE id = NEW.source_id AND content_id = NEW.content_id)
    THEN RAISE(ABORT, 'restore_source_missing') END;

  INSERT INTO protected_drafts (content_id, id, payload_schema_version, payload, protected_at, protected_by, protected_name)
    SELECT id, NEW.protection_id, payload_schema_version, payload, NEW.created_at, NEW.actor_id, NEW.actor_name
    FROM content_drafts WHERE id = NEW.content_id
    ON CONFLICT(content_id) DO UPDATE SET id = excluded.id, payload_schema_version = excluded.payload_schema_version,
      payload = excluded.payload, protected_at = excluded.protected_at, protected_by = excluded.protected_by, protected_name = excluded.protected_name;

  -- Reuse the normal atomic update and its version check. No publication writes.
  INSERT INTO draft_operations (actor_id, operation_id, fingerprint, kind, content_id, expected_version, response, created_at)
    VALUES (NEW.actor_id, NEW.operation_id, NEW.fingerprint, 'update', NEW.content_id, NEW.expected_version, NEW.response, NEW.created_at);
END;
CREATE TRIGGER validate_publication_url BEFORE INSERT ON publication_operations BEGIN
  SELECT CASE WHEN NEW.target_slug IS NULL OR NEW.routes IS NULL
    THEN RAISE(ABORT, 'missing_publication_routes') END;
  SELECT CASE WHEN EXISTS (SELECT 1 FROM event_url_owners WHERE slug = NEW.target_slug AND content_id IS NOT NEW.content_id)
    THEN RAISE(ABORT, 'url_reserved') END;
END;
CREATE TRIGGER immutable_publication_routes BEFORE UPDATE ON publication_operations
WHEN NEW.target_slug IS NOT OLD.target_slug OR NEW.routes IS NOT OLD.routes
BEGIN SELECT RAISE(ABORT, 'immutable_publication_routes'); END;
CREATE TRIGGER validate_publication_url_retry BEFORE UPDATE OF state ON publication_operations
WHEN NEW.state IN ('ready', 'delivering') BEGIN
  SELECT CASE WHEN NEW.routes IS NULL OR NEW.target_slug IS NULL
    THEN RAISE(ABORT, 'missing_publication_routes') END;
  SELECT CASE WHEN EXISTS (SELECT 1 FROM event_url_owners WHERE slug = NEW.target_slug AND content_id IS NOT NEW.content_id)
    THEN RAISE(ABORT, 'url_reserved') END;
END;
CREATE TRIGGER finalize_publication_url AFTER UPDATE OF state ON publication_operations
WHEN NEW.state = 'succeeded' AND OLD.state IN ('delivering', 'unknown') BEGIN
  SELECT CASE WHEN NEW.routes IS NULL OR NEW.target_slug IS NULL
    THEN RAISE(ABORT, 'missing_publication_routes') END;
  SELECT CASE WHEN EXISTS (SELECT 1 FROM event_url_owners WHERE slug = NEW.target_slug AND content_id IS NOT NEW.content_id)
    THEN RAISE(ABORT, 'url_reserved') END;
  INSERT INTO event_url_owners(slug, content_id, origin) VALUES (NEW.target_slug, NEW.content_id, 'cms')
    ON CONFLICT(slug) DO NOTHING;
  INSERT INTO event_canonical_urls(content_id, slug) VALUES (NEW.content_id, NEW.target_slug)
    ON CONFLICT(content_id) DO UPDATE SET slug = excluded.slug;
END;
PRAGMA defer_foreign_keys = OFF;
-- Existing WordPress category IDs retained as the draft catalog, not public schema IDs.
CREATE TABLE blog_categories (id TEXT PRIMARY KEY, name TEXT NOT NULL);
INSERT INTO blog_categories VALUES ('1', 'Uncategorized');
INSERT INTO blog_categories VALUES ('2631', '映画監督、日々の暮らし');
INSERT INTO blog_categories VALUES ('2879', '雑木林コラム');
INSERT INTO blog_categories VALUES ('2644', '上映会・イベントレポート');
INSERT INTO blog_categories VALUES ('2839', '制作日誌');
