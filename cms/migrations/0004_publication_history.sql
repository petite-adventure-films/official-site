-- Internal publication groundwork; no public route or deployment provider yet.
CREATE TABLE publication_operations (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL,
  operation_id TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  content_id TEXT NOT NULL REFERENCES content_drafts(id),
  draft_version INTEGER NOT NULL,
  expected_publication_version INTEGER NOT NULL,
  payload TEXT CHECK (payload IS NULL OR json_valid(payload)),
  draft_snapshot TEXT CHECK (draft_snapshot IS NULL OR json_valid(draft_snapshot)),
  content_hash TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('ready', 'delivering', 'unknown', 'failed', 'succeeded', 'noop')),
  attempt INTEGER NOT NULL DEFAULT 0,
  receipt TEXT,
  revision_id TEXT,
  created_at TEXT NOT NULL,
  completed_at TEXT,
  UNIQUE(actor_id, operation_id),
  CHECK (state IN ('succeeded', 'noop') OR (payload IS NOT NULL AND draft_snapshot IS NOT NULL))
);
-- Until a durable queue is connected, only one unresolved operation is admitted.
CREATE UNIQUE INDEX publication_single_active ON publication_operations((1))
  WHERE state IN ('ready', 'delivering', 'unknown');

CREATE TABLE publication_revisions (
  id TEXT PRIMARY KEY,
  content_id TEXT NOT NULL REFERENCES content_drafts(id),
  version INTEGER NOT NULL,
  payload TEXT NOT NULL CHECK (json_valid(payload)),
  content_hash TEXT NOT NULL,
  published_at TEXT NOT NULL,
  published_by TEXT NOT NULL,
  UNIQUE(content_id, version)
);
CREATE TABLE publication_state (
  content_id TEXT PRIMARY KEY REFERENCES content_drafts(id),
  version INTEGER NOT NULL,
  revision_id TEXT NOT NULL REFERENCES publication_revisions(id),
  content_hash TEXT NOT NULL
);
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

-- The operation, pointer, history and pruning commit or roll back together.
CREATE TRIGGER finalize_publication AFTER UPDATE OF state ON publication_operations
WHEN NEW.state = 'succeeded' AND OLD.state IN ('delivering', 'unknown') BEGIN
  SELECT CASE WHEN NEW.receipt IS NULL OR NEW.revision_id IS NULL OR NEW.completed_at IS NULL
    THEN RAISE(ABORT, 'missing_confirmation') END;
  SELECT CASE WHEN COALESCE((SELECT version FROM publication_state WHERE content_id = NEW.content_id), 0) != NEW.expected_publication_version
    THEN RAISE(ABORT, 'publication_version_conflict') END;
  INSERT INTO publication_revisions (id, content_id, version, payload, content_hash, published_at, published_by)
    VALUES (NEW.revision_id, NEW.content_id, NEW.expected_publication_version + 1, OLD.payload, NEW.content_hash, NEW.completed_at, NEW.actor_id);
  INSERT INTO publication_state (content_id, version, revision_id, content_hash)
    VALUES (NEW.content_id, NEW.expected_publication_version + 1, NEW.revision_id, NEW.content_hash)
    ON CONFLICT(content_id) DO UPDATE SET version = excluded.version, revision_id = excluded.revision_id, content_hash = excluded.content_hash;
  DELETE FROM publication_revisions WHERE content_id = NEW.content_id AND id NOT IN
    (SELECT id FROM publication_revisions WHERE content_id = NEW.content_id ORDER BY version DESC LIMIT 3);
END;
