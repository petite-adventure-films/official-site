import { blogDraftFromPublication, localBlogSlugPrefix } from '../blog-publication';
import type { Database } from '../repositories/content-drafts';
import type { Delivery, DeliveryResult, PublicationDelivery } from '../services/publication';
import { exportPublishedEvents } from '../services/publication-export';
import { PublicationUrls } from '../services/publication-urls';
import { tags } from '../routes/tags';

/** Loopback runner builds and atomically activates real static Astro releases. */
export class LocalPublicationDelivery implements PublicationDelivery {
  readonly supportsLocalBlog = true;
  constructor(private db: Database, private port = 8789, readonly localSiteOrigin = 'http://127.0.0.1:4327') {}
  private async send(path: string, body: unknown): Promise<DeliveryResult> {
    const response = await fetch(`http://127.0.0.1:${this.port}/${path}`, { method: 'POST', redirect: 'manual',
      headers: { 'X-CMS-Runner': 'local-publication', 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(error => { console.error('Local runner connection:', String(error)); throw error; });
    if (!response.ok) { console.error('Local runner status', response.status); throw new Error('runner_unavailable'); }
    return response.json();
  }
  private async manifest(delivery: Delivery) {
    const snapshot = await exportPublishedEvents(this.db);
    const available = await tags(this.db);
    const operation = await this.db.prepare('SELECT created_at FROM publication_operations WHERE id = ?').bind(delivery.operationId).first<{ created_at: string }>();
    if (delivery.payload.type === 'event') {
      snapshot.events = [...snapshot.events.filter(event => event.id !== delivery.contentId),
        { id: delivery.contentId, publishedAt: operation!.created_at, payload: delivery.payload }];
    }
    snapshot.filmTags = available.filmTags.filter(tag => snapshot.events.some(e => e.payload.filmTagIds.includes(tag.id)));
    snapshot.eventTags = available.eventTags.filter(tag => snapshot.events.some(e => e.payload.eventTagIds.includes(tag.id)));
    const redirects = [];
    for (const event of snapshot.events) redirects.push(...(event.id === delivery.contentId ? delivery.routes :
      await new PublicationUrls(this.db).plan(event.id, event.payload.slug)).redirects);
    const blogs = [];
    const published = await this.db.prepare(`SELECT s.content_id, r.payload, u.slug
      FROM publication_state s JOIN content_drafts d ON d.id = s.content_id AND d.type = 'blog'
      JOIN publication_revisions r ON r.id = s.revision_id AND r.content_id = s.content_id
      JOIN event_canonical_urls u ON u.content_id = s.content_id
      WHERE s.content_id <> ? ORDER BY s.content_id`).bind(delivery.contentId)
      .all<{ content_id: string; payload: string; slug: string }>();
    for (const row of published.results) {
      const content = blogDraftFromPublication(JSON.parse(row.payload));
      if (!content || row.slug !== localBlogSlugPrefix + content.slug) throw new Error('invalid_blog_release');
      const routes = await new PublicationUrls(this.db).plan(row.content_id, row.slug);
      blogs.push({ path: routes.canonicalPath, content });
      redirects.push(...routes.redirects);
    }
    if (delivery.payload.type === 'blog') {
      blogs.push({ path: delivery.routes.canonicalPath, content: delivery.payload.content });
      redirects.push(...delivery.routes.redirects);
    }
    return { delivery, snapshot, redirects, blogs };
  }
  async deploy(delivery: Delivery): Promise<DeliveryResult> {
    let manifest;
    try { manifest = await this.manifest(delivery); }
    catch { return { status: 'failed', operationId: delivery.operationId, attempt: delivery.attempt, hash: delivery.hash, receipt: 'snapshot-validation-failed' }; }
    return this.send('deploy', manifest);
  }
  inspect(delivery: Delivery) { return this.send('inspect', { delivery }); }
}
