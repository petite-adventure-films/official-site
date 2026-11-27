-- Persistent reservations survive interrupted R2 uploads. Confirmed assets use media_uploads.
CREATE TABLE wordpress_media_objects (
  sha256 TEXT PRIMARY KEY CHECK(length(sha256) = 64),
  asset_id TEXT NOT NULL UNIQUE,
  state TEXT NOT NULL CHECK(state IN ('reserved', 'confirmed')),
  metadata_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE wordpress_media_sources (
  source_url TEXT PRIMARY KEY,
  sha256 TEXT REFERENCES wordpress_media_objects(sha256),
  disposition TEXT NOT NULL CHECK(disposition IN ('verified-local', 'recovery-verified-local', 'approved-exclusion')),
  evidence_json TEXT NOT NULL,
  CHECK((disposition = 'approved-exclusion' AND sha256 IS NULL) OR (disposition <> 'approved-exclusion' AND sha256 IS NOT NULL))
);
CREATE TRIGGER wordpress_media_identity_immutable
BEFORE UPDATE OF sha256, asset_id, metadata_json ON wordpress_media_objects
BEGIN SELECT RAISE(ABORT, 'immutable_wordpress_media_identity'); END;
CREATE TRIGGER wordpress_media_source_immutable
BEFORE UPDATE ON wordpress_media_sources
BEGIN SELECT RAISE(ABORT, 'immutable_wordpress_media_source'); END;
