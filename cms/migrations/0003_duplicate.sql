ALTER TABLE draft_operations ADD COLUMN source_id TEXT;
CREATE TRIGGER validate_duplicate_source BEFORE INSERT ON draft_operations
WHEN NEW.source_id IS NOT NULL
BEGIN
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM content_drafts WHERE id = NEW.source_id AND version = NEW.expected_version
  ) THEN RAISE(ABORT, 'draft_version_conflict') END;
END;
DROP TRIGGER apply_draft_operation;
CREATE TRIGGER apply_draft_operation AFTER INSERT ON draft_operations
BEGIN
  INSERT INTO content_drafts (
    id, version, type, payload_schema_version, payload,
    created_at, updated_at, created_by, updated_by, copied_from_id
  ) SELECT NEW.content_id, 1, 'event', json_extract(NEW.response, '$.payloadSchemaVersion'),
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
