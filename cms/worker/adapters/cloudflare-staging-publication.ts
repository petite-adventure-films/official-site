import type { Database } from '../repositories/content-drafts';
import type { MediaBucket } from '../routes/media';
import type { Delivery, DeliveryResult, PublicationDelivery } from '../services/publication';
import { buildPublicationManifest } from '../services/publication-manifest';

export const stagingCmsOrigin = 'https://paf-cms-staging.petiteadventurefilms2.workers.dev';
const stagingSiteOrigin = 'https://paf-site-staging.petiteadventurefilms2.workers.dev';
type Fetcher = { fetch(request: Request): Promise<Response> };
export function stagingRunner(url: string, secret: string): Fetcher | null {
  let endpoint: URL;
  try { endpoint = new URL(url); } catch { return null; }
  if (secret.length < 32) return null;
  if (endpoint.protocol !== 'https:' || endpoint.origin === stagingSiteOrigin || endpoint.origin === stagingCmsOrigin ||
      endpoint.pathname !== '/' || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) return null;
  return {
    fetch(request) {
      const destination = new URL(new URL(request.url).pathname, endpoint);
      return fetch(destination, {
        method: 'POST', redirect: 'manual', body: request.body,
        // The temporary runner uses its own credential, never the site's Access token.
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
      });
    },
  };
}
type Report = {
  status?: string;
  operationId?: string;
  attempt?: number;
  hash?: string;
  deploymentId?: string;
  releaseHash?: string;
};
const unknown = { status: 'unknown' } as const;

export class CloudflareStagingPublication implements PublicationDelivery {
  readonly supportsLocalBlog = true;
  readonly localSiteOrigin = stagingSiteOrigin;

  constructor(
    private db: Database,
    private media: MediaBucket,
    private runner: Fetcher,
    private access: { id: string; secret: string },
    private fetchSite: typeof fetch = (...args) => fetch(...args),
  ) {}

  async deploy(delivery: Delivery): Promise<DeliveryResult> {
    let manifest;
    try {
      manifest = await buildPublicationManifest(this.db, this.media, delivery);
    } catch {
      return { ...this.identity(delivery), status: 'failed', receipt: 'snapshot-validation-failed' };
    }
    const response = await this.runner.fetch(new Request('https://publication-runner/deploy', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(manifest),
    }));
    if (!response.ok) return unknown;
    return this.inspect(delivery);
  }

  async inspect(delivery: Delivery): Promise<DeliveryResult> {
    const identity = this.identity(delivery);
    const response = await this.runner.fetch(new Request('https://publication-runner/inspect', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(identity),
    }));
    if (!response.ok) return unknown;
    const report = await response.json() as Report;
    if (report.operationId !== identity.operationId || report.attempt !== identity.attempt || report.hash !== identity.hash) return unknown;
    if (report.status === 'failed') return { ...identity, status: 'failed', receipt: 'runner-confirmed-failure' };
    if (report.status !== 'succeeded' || !report.deploymentId || !/^[a-f0-9]{64}$/.test(report.releaseHash ?? '')) return unknown;

    const url = new URL('/__release.json', this.localSiteOrigin);
    url.searchParams.set('attempt', `${identity.operationId}-${identity.attempt}`);
    const live = await this.fetchSite(url, {
      redirect: 'manual', cache: 'no-store',
      headers: { 'CF-Access-Client-Id': this.access.id, 'CF-Access-Client-Secret': this.access.secret },
    });
    if (!live.ok || !live.headers.get('Content-Type')?.includes('application/json')) return unknown;
    const marker = await live.json() as { releaseId?: string; hash?: string };
    if (marker.releaseId !== `${identity.operationId}-${identity.attempt}` || marker.hash !== report.releaseHash) return unknown;
    return { ...identity, status: 'succeeded', receipt: `${report.deploymentId}:${report.releaseHash}` };
  }

  private identity(delivery: Delivery) {
    return { operationId: delivery.operationId, attempt: delivery.attempt, hash: delivery.hash };
  }
}
