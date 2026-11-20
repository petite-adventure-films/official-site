import { readFile, readdir } from 'node:fs/promises';
import { unstable_splitSqlQuery } from 'wrangler';
import { beforeEach, afterEach, expect, test, vi } from 'vitest';
import { createWorkerFixture } from '../../src/testing/fixtures';
import { ContentDraftRepository } from '../repositories/content-drafts';
import { emptyBlogDraft } from '../../src/features/blog/draft';
import { PublicationService } from './publication';
import { buildPublicationManifest } from './publication-manifest';
import { HostedStaging } from './hosted-staging';
import type { MediaBucket } from '../routes/media';
let fixture: Awaited<ReturnType<typeof createWorkerFixture>>;
let coordinator: HostedStaging;
let delivery: any;
let manifest: any;
let service: PublicationService;
const versionId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const deploymentId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const releaseHash = 'a'.repeat(64);
const fetcher = vi.fn<typeof fetch>();
beforeEach(async () => {
  fixture = await createWorkerFixture();
  const dir = new URL('../../migrations/', import.meta.url);
  for (const file of (await readdir(dir)).filter(f => f.endsWith('.sql')).sort()) {
    const sql = await readFile(new URL(file, dir), 'utf8');
    await fixture.db.batch(unstable_splitSqlQuery(sql).map(s => fixture.db.prepare(s)));
  }
  const drafts = new ContentDraftRepository(fixture.db);
  const draft = await drafts.save({ actor:'test', operationId:crypto.randomUUID(), type:'blog', payload: { ...emptyBlogDraft(), title:'固定候補', slug:'hosted-test', categoryId:'1' } });
  service = new PublicationService(fixture.db);
  const op = await service.prepare({ actor:'test',operationId:crypto.randomUUID(),contentId:draft.id,expectedVersion:1,expectedPublicationVersion:0 },true);
  await service.deliver(op.id, { deploy:async d => { delivery = d; return {status:'unknown'}; },inspect:async () => ({status:'unknown'}) });
  const media = await fixture.runtime.getR2Bucket('MEDIA') as unknown as MediaBucket;
  manifest = await buildPublicationManifest(fixture.db, media, delivery);
  fetcher.mockReset().mockResolvedValue(Response.json({}));
  coordinator = new HostedStaging({ DB:fixture.db, MEDIA:media, STAGING_SITE_ACCESS_ID:'test', STAGING_SITE_ACCESS_SECRET:'test' }, fetcher);
});
afterEach(async () => { await fixture.dispose(); });
async function enqueue() { return coordinator.fetch(new Request('https://internal/deploy',{method:'POST',body:JSON.stringify(manifest)})); }
test('concurrent enqueue and claims preserve one immutable candidate and one execution', async () => {
  await Promise.all([enqueue(),enqueue()]);
  const claims = (await Promise.all([coordinator.claim(),coordinator.claim()])).filter(Boolean);
  expect(claims).toHaveLength(1);
  expect(claims[0]!.manifest).toEqual(manifest);
  manifest.blogs[0].content.title = '差し替え禁止';
  await enqueue();
  expect(await coordinator.claim()).toBeNull();
});
test('activation permit is single use and failure after permit cannot unblock another publication', async () => {
  await enqueue(); const claim = (await coordinator.claim())!;
  expect(await coordinator.report('activate',{...claim, token:crypto.randomUUID(),versionId,releaseHash})).toBe(false);
  expect(await coordinator.report('activate',{...claim,versionId,releaseHash})).toBe(true);
  expect(await coordinator.report('activate',{...claim,versionId,releaseHash})).toBe(false);
  expect(await coordinator.report('fail',claim)).toBe(false);
  await coordinator.reconcile();
  expect((await service.get(delivery.operationId)).state).toBe('unknown');
});
test('wrong live release cannot confirm; exact release settles history without a browser', async () => {
  await enqueue(); const claim = (await coordinator.claim())!;
  await coordinator.report('activate',{...claim,versionId,releaseHash});
  const report = {...claim,versionId,releaseHash,deploymentId};
  expect(await coordinator.report('succeed', report)).toBe(false);
  fetcher.mockImplementation(async () => Response.json({releaseId:`${delivery.operationId}-1`,hash:releaseHash}));
  expect(await coordinator.report('succeed',report)).toBe(true);
  await coordinator.reconcile();
  expect((await service.get(delivery.operationId)).state).toBe('succeeded');
  expect(await service.history(delivery.contentId)).toHaveLength(1);
  await coordinator.reconcile();
  expect(await service.history(delivery.contentId)).toHaveLength(1);
});
test('confirmed pre-activation failure settles without changing public history', async () => {
  await enqueue(); const claim = (await coordinator.claim())!;
  expect(await coordinator.report('fail',claim)).toBe(true);
  await coordinator.reconcile();
  expect((await service.get(delivery.operationId)).state).toBe('failed');
  expect(await service.history(delivery.contentId)).toHaveLength(0);
});
