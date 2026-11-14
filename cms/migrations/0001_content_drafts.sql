CREATE TABLE content_drafts (
  id TEXT PRIMARY KEY,
  version INTEGER NOT NULL CHECK (version >= 1),
  type TEXT NOT NULL CHECK (type = 'event'),
  payload_schema_version TEXT NOT NULL,
  payload TEXT NOT NULL CHECK (json_valid(payload)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  copied_from_id TEXT
);
CREATE INDEX content_drafts_created ON content_drafts(created_at DESC, id DESC);

CREATE TABLE draft_operations (
  actor_id TEXT NOT NULL,
  operation_id TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('create', 'update')),
  content_id TEXT NOT NULL,
  expected_version INTEGER,
  response TEXT NOT NULL CHECK (json_valid(response)),
  created_at TEXT NOT NULL,
  PRIMARY KEY (actor_id, operation_id)
);

-- One insert commits the operation response and draft together. Trigger failure
-- rolls back both, including a stale version or a duplicate operation ID.
CREATE TRIGGER apply_draft_operation AFTER INSERT ON draft_operations
BEGIN
  INSERT INTO content_drafts (
    id, version, type, payload_schema_version, payload,
    created_at, updated_at, created_by, updated_by
  ) SELECT NEW.content_id, 1, 'event', json_extract(NEW.response, '$.payloadSchemaVersion'),
    json_extract(NEW.response, '$.payload'), NEW.created_at, NEW.created_at, NEW.actor_id, NEW.actor_id
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
