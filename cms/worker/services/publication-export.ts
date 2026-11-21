import Ajv from 'ajv/dist/2020';
import schema from '../../../packages/content-schema/schemas/content/event-publication.schema.json';
import type { CmsEventSnapshot, CmsEventTag } from '../../../packages/content-schema/types/cms-events';
import type { EventPublication } from '../../../packages/content-schema/types/event-publication';
import type { Database } from '../repositories/content-drafts';

const validate = new Ajv({ strictTypes: false }).compile<EventPublication>(schema);
type Row = {
  id: string; version: number; hash: string; revisionContentId: string | null;
  revisionVersion: number | null; revisionHash: string | null; publishedAt: string | null;
  payload: string | null; slug: string | null;
};
/** Read-only current publication set. A single SQL statement observes one DB snapshot. */
export async function exportPublishedEvents(db: Database): Promise<CmsEventSnapshot> {
  const result = await db.prepare(`SELECT
    (SELECT json_group_array(json_object(
      'id', s.content_id, 'version', s.version, 'hash', s.content_hash,
      'revisionContentId', r.content_id, 'revisionVersion', r.version, 'revisionHash', r.content_hash,
      'publishedAt', r.published_at, 'payload', r.payload, 'slug', u.slug))
      FROM publication_state s
      LEFT JOIN publication_revisions r ON r.id = s.revision_id
      LEFT JOIN event_canonical_urls u ON u.content_id = s.content_id
      WHERE NOT EXISTS (SELECT 1 FROM content_drafts d WHERE d.id = s.content_id AND d.type <> 'event')) AS events,
    (SELECT json_group_array(json_object('id', id, 'name', name, 'kind', kind)) FROM tags) AS tags
  `).first<{ events: string; tags: string }>();
  if (!result) throw new Error('publication_export_unavailable');
  const rows: Row[] = JSON.parse(result.events);
  const tags: (CmsEventTag & { kind: string })[] = JSON.parse(result.tags);
  const events: CmsEventSnapshot['events'] = [];
  for (const row of rows) {
    if (row.revisionContentId !== row.id || row.revisionVersion !== row.version ||
        row.revisionHash !== row.hash || !row.payload || !row.publishedAt)
      throw new Error('invalid_publication_pointer');
    const payload: unknown = JSON.parse(row.payload);
    if (!validate(payload) || payload.slug !== row.slug) throw new Error('invalid_publication_payload');
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(row.payload));
    const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
    if (hash !== row.hash) throw new Error('invalid_publication_hash');
    events.push({ id: row.id, publishedAt: row.publishedAt, payload });
  }
  events.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  function usedTags(kind: string, ids: string[]): CmsEventTag[] {
    return [...new Set(ids)].sort().map(id => {
      const tag = tags.find(tag => tag.kind === kind && tag.id === id);
      if (!tag) throw new Error('missing_publication_tag');
      return { id: tag.id, name: tag.name };
    });
  }
  return {
    schemaVersion: 'cms-events/v1', events,
    filmTags: usedTags('film', events.flatMap(event => event.payload.filmTagIds)),
    eventTags: usedTags('event', events.flatMap(event => event.payload.eventTagIds)),
  };
}
