INSERT INTO event_url_owners(slug, content_id, origin)
  SELECT json_extract(r.payload, '$.slug'), s.content_id, 'cms' FROM publication_state s JOIN publication_revisions r ON r.id = s.revision_id;
INSERT INTO event_canonical_urls(content_id, slug)
  SELECT s.content_id, json_extract(r.payload, '$.slug') FROM publication_state s JOIN publication_revisions r ON r.id = s.revision_id;
