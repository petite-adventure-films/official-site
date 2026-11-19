-- Staging-only consumers; production publication remains disabled.
CREATE TABLE hosted_staging_jobs (
  operation_id TEXT NOT NULL REFERENCES publication_operations(id),
  attempt INTEGER NOT NULL,
  content_hash TEXT NOT NULL,
  manifest_key TEXT NOT NULL,
  state TEXT NOT NULL CHECK(state IN ('preparing','queued','building','activating','succeeded','failed')),
  claim_token TEXT,
  version_id TEXT,
  release_hash TEXT,
  deployment_id TEXT,
  hook_requested_at INTEGER,
  created_at TEXT NOT NULL,
  PRIMARY KEY(operation_id, attempt)
);
