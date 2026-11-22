CREATE TABLE media_uploads (
  id TEXT PRIMARY KEY,
  actor TEXT NOT NULL,
  operation_id TEXT NOT NULL,
  request_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  asset_json TEXT,
  UNIQUE(actor, operation_id)
);
