CREATE TABLE protected_drafts (
  content_id TEXT PRIMARY KEY REFERENCES content_drafts(id),
  id TEXT NOT NULL UNIQUE,
  payload_schema_version TEXT NOT NULL,
  payload TEXT NOT NULL CHECK(json_valid(payload)),
  protected_at TEXT NOT NULL,
  protected_by TEXT NOT NULL
);
CREATE TABLE restore_operations (
  actor_id TEXT NOT NULL,
  operation_id TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  content_id TEXT NOT NULL REFERENCES content_drafts(id),
  expected_version INTEGER NOT NULL,
  source_kind TEXT NOT NULL CHECK(source_kind IN ('publication', 'protectedDraft')),
  source_id TEXT NOT NULL,
  protection_id TEXT NOT NULL,
  response TEXT NOT NULL CHECK(json_valid(response)),
  created_at TEXT NOT NULL,
  PRIMARY KEY(actor_id, operation_id)
);
CREATE TRIGGER apply_restore AFTER INSERT ON restore_operations BEGIN
  SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM content_drafts WHERE id = NEW.content_id AND version = NEW.expected_version)
    THEN RAISE(ABORT, 'draft_version_conflict') END;
  SELECT CASE WHEN NEW.source_kind = 'publication' AND NOT EXISTS
    (SELECT 1 FROM publication_revisions WHERE id = NEW.source_id AND content_id = NEW.content_id)
    THEN RAISE(ABORT, 'restore_source_missing') END;
  SELECT CASE WHEN NEW.source_kind = 'protectedDraft' AND NOT EXISTS
    (SELECT 1 FROM protected_drafts WHERE id = NEW.source_id AND content_id = NEW.content_id)
    THEN RAISE(ABORT, 'restore_source_missing') END;

  INSERT INTO protected_drafts (content_id, id, payload_schema_version, payload, protected_at, protected_by)
    SELECT id, NEW.protection_id, payload_schema_version, payload, NEW.created_at, NEW.actor_id
    FROM content_drafts WHERE id = NEW.content_id
    ON CONFLICT(content_id) DO UPDATE SET id = excluded.id, payload_schema_version = excluded.payload_schema_version,
      payload = excluded.payload, protected_at = excluded.protected_at, protected_by = excluded.protected_by;

  -- Reuse the normal atomic update and its version check. No publication writes.
  INSERT INTO draft_operations (actor_id, operation_id, fingerprint, kind, content_id, expected_version, response, created_at)
    VALUES (NEW.actor_id, NEW.operation_id, NEW.fingerprint, 'update', NEW.content_id, NEW.expected_version, NEW.response, NEW.created_at);
END;
