ALTER TABLE publication_operations ADD COLUMN actor_name TEXT;
ALTER TABLE publication_revisions ADD COLUMN published_name TEXT;
ALTER TABLE restore_operations ADD COLUMN actor_name TEXT;
ALTER TABLE protected_drafts ADD COLUMN protected_name TEXT;
DROP TRIGGER finalize_publication;
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

DROP TRIGGER apply_restore;
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
