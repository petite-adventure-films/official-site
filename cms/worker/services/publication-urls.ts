import type { Database } from '../repositories/content-drafts';
import { slugIssue } from '../../src/features/content/slug';
export class PublicationUrlConflict extends Error {}
export type EventRoutes = { canonicalPath: string; redirects: { from: string; to: string }[] };
export function eventPath(slug: string) {
  if (slugIssue(slug)) throw new PublicationUrlConflict('invalid_slug');
  return `/events/${encodeURIComponent(slug)}/`;
}
export class PublicationUrls {
  constructor(private db: Database) {}
  async plan(contentId: string, slug: string): Promise<EventRoutes> {
    const canonicalPath = eventPath(slug);
    const owner = await this.db.prepare('SELECT content_id FROM event_url_owners WHERE slug = ?').bind(slug).first<{ content_id: string | null }>();
    if (owner && owner.content_id !== contentId) throw new PublicationUrlConflict('url_reserved');
    const previous = await this.db.prepare('SELECT slug FROM event_url_owners WHERE content_id = ? ORDER BY slug').bind(contentId).all<{ slug: string }>();
    return { canonicalPath, redirects: previous.results.filter(row => row.slug !== slug)
      .map(row => ({ from: eventPath(row.slug), to: canonicalPath })) };
  }
  async resolve(slug: string): Promise<{ kind: 'page' | 'redirect'; path: string; contentId: string } | null> {
    eventPath(slug);
    const row = await this.db.prepare(`SELECT owner.content_id, current.slug FROM event_url_owners AS owner
      JOIN event_canonical_urls AS current ON current.content_id = owner.content_id WHERE owner.slug = ?`).bind(slug)
      .first<{ content_id: string; slug: string }>();
    return row ? { kind: row.slug === slug ? 'page' : 'redirect', path: eventPath(row.slug), contentId: row.content_id } : null;
  }
}
