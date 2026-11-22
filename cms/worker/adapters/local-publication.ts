import type { MediaBucket } from '../routes/media';
import type { Database } from '../repositories/content-drafts';
import type { Delivery, DeliveryResult, PublicationDelivery } from '../services/publication';

import { buildPublicationManifest } from '../services/publication-manifest';

/** Loopback runner builds and atomically activates real static Astro releases. */
export class LocalPublicationDelivery implements PublicationDelivery {
  readonly supportsLocalBlog = true;
  constructor(private db: Database, private port = 8789, readonly localSiteOrigin = 'http://127.0.0.1:4327', private media?: MediaBucket) {}
  private async send(path: string, body: unknown): Promise<DeliveryResult> {
    const response = await fetch(`http://127.0.0.1:${this.port}/${path}`, { method: 'POST', redirect: 'manual',
      headers: { 'X-CMS-Runner': 'local-publication', 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(error => { console.error('Local runner connection:', String(error)); throw error; });
    if (!response.ok) { console.error('Local runner status', response.status); throw new Error('runner_unavailable'); }
    return response.json();
  }
  async deploy(delivery: Delivery): Promise<DeliveryResult> {
    let manifest;
    try { manifest = await buildPublicationManifest(this.db, this.media, delivery); }
    catch { return { status: 'failed', operationId: delivery.operationId, attempt: delivery.attempt, hash: delivery.hash, receipt: 'snapshot-validation-failed' }; }
    return this.send('deploy', manifest);
  }
  inspect(delivery: Delivery) { return this.send('inspect', { delivery }); }
}
