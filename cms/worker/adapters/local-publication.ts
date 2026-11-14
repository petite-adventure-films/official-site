import type { Database } from '../repositories/content-drafts';
import type { Delivery, DeliveryResult, PublicationDelivery } from '../services/publication';
import { exportPublishedEvents } from '../services/publication-export';
import { PublicationUrls } from '../services/publication-urls';
import { tags } from '../routes/tags';

/** Loopback runner builds and atomically activates real static Astro releases. */
export class LocalPublicationDelivery implements PublicationDelivery {
  constructor(private db: Database) {}
  private async send(path: string, body: unknown): Promise<DeliveryResult> {
    const response = await fetch(`http://127.0.0.1:8789/${path}`, { method: 'POST', redirect: 'manual',
      headers: { 'X-CMS-Runner': 'local-publication', 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(error => { console.error('Local runner connection:', String(error)); throw error; });
    if (!response.ok) { console.error('Local runner status', response.status); throw new Error('runner_unavailable'); }
    return response.json();
  }
  private async manifest(delivery: Delivery) {
    const snapshot = await exportPublishedEvents(this.db);
    const available = await tags(this.db);
    const operation = await this.db.prepare('SELECT created_at FROM publication_operations WHERE id = ?').bind(delivery.operationId).first<{ created_at: string }>();
    snapshot.events = [...snapshot.events.filter(event => event.id !== delivery.contentId),
      { id: delivery.contentId, publishedAt: operation!.created_at, payload: delivery.payload }];
    snapshot.filmTags = available.filmTags.filter(tag => snapshot.events.some(e => e.payload.filmTagIds.includes(tag.id)));
    snapshot.eventTags = available.eventTags.filter(tag => snapshot.events.some(e => e.payload.eventTagIds.includes(tag.id)));
    const redirects = [];
    for (const event of snapshot.events) redirects.push(...(event.id === delivery.contentId ? delivery.routes :
      await new PublicationUrls(this.db).plan(event.id, event.payload.slug)).redirects);
    return { delivery, snapshot, redirects };
  }
  async deploy(delivery: Delivery): Promise<DeliveryResult> {
    let manifest;
    try { manifest = await this.manifest(delivery); }
    catch { return { status: 'failed', operationId: delivery.operationId, attempt: delivery.attempt, hash: delivery.hash, receipt: 'snapshot-validation-failed' }; }
    return this.send('deploy', manifest);
  }
  inspect(delivery: Delivery) { return this.send('inspect', { delivery }); }
}
