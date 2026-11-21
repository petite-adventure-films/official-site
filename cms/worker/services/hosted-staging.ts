import type { Database } from '../repositories/content-drafts';
import type { MediaBucket } from '../routes/media';
import type { Delivery } from './publication';
import { PublicationService } from './publication';
import { CloudflareStagingPublication } from '../adapters/cloudflare-staging-publication';

type Job = { operation_id: string; attempt: number; content_hash: string; manifest_key: string;
  state: string; claim_token: string | null; version_id: string | null; release_hash: string | null; deployment_id: string | null };
export type HostedEnvironment = { DB: Database; MEDIA: MediaBucket; STAGING_BUILD_SECRET?: string;
  STAGING_DEPLOY_HOOK?: string; STAGING_SITE_ACCESS_ID?: string; STAGING_SITE_ACCESS_SECRET?: string };
const uuid = (v: unknown): v is string => typeof v === 'string' && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(v);
const hash = (v: unknown): v is string => typeof v === 'string' && /^[a-f0-9]{64}$/.test(v);
export class HostedStaging {
  constructor(private env: HostedEnvironment, private fetcher: typeof fetch = (...args) => fetch(...args)) {}
  private async job(operationId: string, attempt: number) {
    return this.env.DB.prepare('SELECT * FROM hosted_staging_jobs WHERE operation_id = ? AND attempt = ?')
      .bind(operationId, attempt).first<Job>();
  }
  async fetch(request: Request): Promise<Response> {
    const value = await request.json() as Record<string, any>;
    if (new URL(request.url).pathname === '/deploy') {
      const d = value.delivery as Delivery;
      // Only the internal CMS adapter invokes this method; there is no public deploy route.
      const op = await this.env.DB.prepare("SELECT id FROM publication_operations WHERE id = ? AND attempt = ? AND content_hash = ? AND state IN ('delivering','unknown')")
        .bind(d.operationId, d.attempt, d.hash).first();
      if (!op || !['event', 'blog', 'news', 'pressCoverage', 'video'].includes(d.payload.type)) return new Response(null, { status: 409 });
      if (!await this.job(d.operationId, d.attempt)) {
        const key = `staging-publication/${d.operationId}/${d.attempt}/${crypto.randomUUID()}.json`;
        const inserted = await this.env.DB.prepare(`INSERT OR IGNORE INTO hosted_staging_jobs
          (operation_id, attempt, content_hash, manifest_key, state, created_at) VALUES (?, ?, ?, ?, 'preparing', ?) RETURNING *`)
          .bind(d.operationId, d.attempt, d.hash, key, new Date().toISOString()).first<Job>();
        if (inserted) {
          await this.env.MEDIA.put(key, new TextEncoder().encode(JSON.stringify(value)).buffer);
          await this.env.DB.prepare("UPDATE hosted_staging_jobs SET state = 'queued' WHERE operation_id = ? AND attempt = ? AND state = 'preparing'")
            .bind(d.operationId, d.attempt).run();
        }
      }
      await this.trigger();
      return Response.json({ status: 'unknown' });
    }
    const row = await this.job(value.operationId, value.attempt);
    if (!row || row.content_hash !== value.hash) return Response.json({ status: 'unknown' });
    return Response.json({ operationId: row.operation_id, attempt: row.attempt, hash: row.content_hash,
      status: ['succeeded','failed'].includes(row.state) ? row.state : 'unknown',
      releaseHash: row.release_hash, deploymentId: row.deployment_id });
  }
  async trigger() {
    const hook = this.env.STAGING_DEPLOY_HOOK;
    if (!hook || !/^https:\/\/api\.cloudflare\.com\/client\/v4\/workers\/builds\/deploy_hooks\/[a-zA-Z0-9_-]+$/.test(hook)) return;
    const row = await this.env.DB.prepare(`UPDATE hosted_staging_jobs SET hook_requested_at = ? WHERE state = 'queued'
      AND (hook_requested_at IS NULL OR hook_requested_at < ?) RETURNING operation_id`)
      .bind(Date.now(), Date.now() - 60_000).first();
    if (row) await this.fetcher(hook, { method: 'POST', redirect: 'manual' });
  }
  async claim() {
    const row = await this.env.DB.prepare(`UPDATE hosted_staging_jobs SET state = 'building', claim_token = ?
      WHERE state = 'queued' AND EXISTS (SELECT 1 FROM publication_operations p WHERE p.id = hosted_staging_jobs.operation_id
        AND p.attempt = hosted_staging_jobs.attempt AND p.state IN ('delivering','unknown')) RETURNING *`)
      .bind(crypto.randomUUID()).first<Job>();
    if (!row) return null;
    const object = await this.env.MEDIA.get(row.manifest_key);
    if (!object) throw new Error('missing_manifest');
    return { operationId: row.operation_id, attempt: row.attempt, hash: row.content_hash, token: row.claim_token,
      manifest: await new Response(object.body).json() };
  }
  async report(action: string, input: Record<string, any>) {
    if (!uuid(input.operationId) || !uuid(input.token) || !Number.isSafeInteger(input.attempt) || !hash(input.hash)) return false;
    const row = await this.job(input.operationId, input.attempt);
    if (!row || row.claim_token !== input.token || row.content_hash !== input.hash) return false;
    if (action === 'activate') {
      if (!uuid(input.versionId) || !hash(input.releaseHash)) return false;
      // Exactly one permit. A repeated request cannot activate an old build again.
      return Boolean(await this.env.DB.prepare(`UPDATE hosted_staging_jobs SET state = 'activating', version_id = ?, release_hash = ?
        WHERE operation_id = ? AND attempt = ? AND claim_token = ? AND state = 'building' RETURNING operation_id`)
        .bind(input.versionId, input.releaseHash, input.operationId, input.attempt, input.token).first());
    }
    if (action === 'fail') {
      if (row.state === 'failed') return true;
      return Boolean(await this.env.DB.prepare(`UPDATE hosted_staging_jobs SET state = 'failed'
        WHERE operation_id = ? AND attempt = ? AND claim_token = ? AND state = 'building' RETURNING operation_id`)
        .bind(input.operationId, input.attempt, input.token).first());
    }
    if (action !== 'succeed' || !uuid(input.deploymentId) || input.versionId !== row.version_id || input.releaseHash !== row.release_hash) return false;
    if (row.state === 'succeeded') return row.deployment_id === input.deploymentId;
    if (row.state !== 'activating') return false;
    const live = await this.fetcher(`https://paf-site-staging.petiteadventurefilms2.workers.dev/__release.json?attempt=${row.operation_id}-${row.attempt}`, {
      redirect: 'manual', cache: 'no-store', headers: { 'CF-Access-Client-Id': this.env.STAGING_SITE_ACCESS_ID!, 'CF-Access-Client-Secret': this.env.STAGING_SITE_ACCESS_SECRET! },
    });
    if (!live.ok || !live.headers.get('Content-Type')?.includes('application/json')) return false;
    const marker = await live.json() as { releaseId: string; hash: string };
    if (marker.releaseId !== `${row.operation_id}-${row.attempt}` || marker.hash !== row.release_hash) return false;
    await this.env.DB.prepare(`UPDATE hosted_staging_jobs SET state = 'succeeded', deployment_id = ?
      WHERE operation_id = ? AND attempt = ? AND state = 'activating'`).bind(input.deploymentId, row.operation_id, row.attempt).run();
    return true;
  }
  async reconcile() {
    await this.trigger();
    const rows = await this.env.DB.prepare(`SELECT p.id FROM publication_operations p JOIN hosted_staging_jobs j
      ON j.operation_id = p.id AND j.attempt = p.attempt WHERE p.state IN ('delivering','unknown') AND j.state IN ('succeeded','failed')`).all<{id: string}>();
    const adapter = new CloudflareStagingPublication(this.env.DB, this.env.MEDIA, this, {
      id: this.env.STAGING_SITE_ACCESS_ID!, secret: this.env.STAGING_SITE_ACCESS_SECRET!,
    }, this.fetcher);
    for (const row of rows.results) await new PublicationService(this.env.DB).reconcile(row.id, adapter);
  }
}
