import { readFile } from 'node:fs/promises';
import { unstable_splitSqlQuery } from 'wrangler';
import { afterEach, beforeEach, expect, test } from 'vitest';
import { createWorkerFixture } from '../../src/testing/fixtures';
import { emptyDraft } from '../../src/features/events/draft';
import { ContentDraftRepository } from '../repositories/content-drafts';
import { PublicationService, type Delivery } from './publication';
import { exportPublishedEvents } from './publication-export';
import { parseCmsEvents } from '../../../astro/src/lib/cms-events';
import { handleAuthenticated } from '../app';
let fixture: Awaited<ReturnType<typeof createWorkerFixture>>;
let drafts: ContentDraftRepository;
let service: PublicationService;
beforeEach(async () => {
  fixture = await createWorkerFixture('local');
  for (const name of ['0001_content_drafts', '0002_tags', '0003_duplicate', '0004_publication_history', '0005_restore', '0006_history_names', '0007_publication_urls']) {
    const sql = await readFile(new URL(`../../migrations/${name}.sql`, import.meta.url), 'utf8');
    await fixture.db.batch(unstable_splitSqlQuery(sql).map(s => fixture.db.prepare(s)));
  }
  drafts = new ContentDraftRepository(fixture.db);
  service = new PublicationService(fixture.db);
});
afterEach(async () => { await fixture?.dispose(); });
const payload = (title: string) => ({ ...emptyDraft(), title, startDate: '2026/12/30', venue: '会場', endDate: '秘密の非表示値' });
const save = (title: string) => drafts.save({ actor: 'private-editor', operationId: crypto.randomUUID(), payload: payload(title) });
const request = (contentId: string, expectedVersion = 1, expectedPublicationVersion = 0) => ({
  actor: 'private-editor', operationId: crypto.randomUUID(), contentId, expectedVersion, expectedPublicationVersion,
});
const result = (d: Delivery, status: 'succeeded' | 'failed') => ({ status, operationId: d.operationId, attempt: d.attempt, hash: d.hash, receipt: 'test-only' });
const adapter = (status: 'succeeded' | 'failed') => ({ deploy: async (d: Delivery) => result(d, status), inspect: async (d: Delivery) => result(d, status) });

test('only confirmed current revisions cross into Astro, never drafts or pending/failed payloads', async () => {
  const draft = await save('公開版');
  await save('下書きだけ');
  const op = await service.prepare(request(draft.id));
  expect((await exportPublishedEvents(fixture.db)).events).toEqual([]);
  await service.deliver(op.id, adapter('succeeded'));
  await drafts.save({ actor: 'private-editor', operationId: crypto.randomUUID(), target: { id: draft.id, expectedVersion: 1 }, payload: payload('未公開の編集') });
  const update = await service.prepare(request(draft.id, 2, 1));
  await service.deliver(update.id, adapter('failed'));
  const snapshot = await exportPublishedEvents(fixture.db);
  expect(snapshot.events).toHaveLength(1);
  expect(parseCmsEvents(snapshot, [])[0].payload.title).toBe('公開版');
  expect(snapshot.events[0].publishedAt).toBe((await service.history(draft.id))[0].published_at);
  expect(JSON.stringify(snapshot)).not.toMatch(/private-editor|秘密|未公開|下書きだけ|revision_id|content_hash/);
  await service.retry(update.id);
  await service.deliver(update.id, { deploy: async () => ({ status: 'unknown' }), inspect: async () => ({ status: 'unknown' }) });
  expect(await exportPublishedEvents(fixture.db)).toEqual(snapshot);
  await service.reconcile(update.id, adapter('succeeded'));
  expect(parseCmsEvents(await exportPublishedEvents(fixture.db), [])[0].payload.title).toBe('未公開の編集');
  expect(await service.history(draft.id)).toHaveLength(2);
});

test('exports all confirmed articles and only referenced tag names without mutating any records', async () => {
  const tag = await fixture.db.prepare("SELECT id, name FROM tags WHERE kind = 'film' LIMIT 1").first<{ id: string; name: string }>();
  expect(tag).not.toBeNull();
  for (let i = 0; i < 21; i++) {
    const draft = await drafts.save({ actor: 'private-editor', operationId: crypto.randomUUID(), payload: { ...payload(`記事${i}`), filmTagIds: [tag!.id] } });
    const op = await service.prepare(request(draft.id));
    await service.deliver(op.id, adapter('succeeded'));
  }
  const before = await fixture.db.prepare('SELECT count(*) AS count FROM publication_operations').first();
  const snapshot = await exportPublishedEvents(fixture.db);
  expect(parseCmsEvents(snapshot, [])).toHaveLength(21);
  expect(snapshot.filmTags).toEqual([tag]);
  expect(snapshot.eventTags).toEqual([]);
  expect(await fixture.db.prepare('SELECT count(*) AS count FROM publication_operations').first()).toEqual(before);
});

test('rejects inconsistent pointers and damaged public payloads instead of dropping articles', async () => {
  const draft = await save('公開版');
  const op = await service.prepare(request(draft.id));
  await service.deliver(op.id, adapter('succeeded'));
  await fixture.db.prepare('UPDATE publication_state SET version = version + 1').run();
  await expect(exportPublishedEvents(fixture.db)).rejects.toThrow('invalid_publication_pointer');
  await fixture.db.prepare('UPDATE publication_state SET version = version - 1').run();
  await fixture.db.prepare("UPDATE publication_revisions SET payload = json_set(payload, '$.title', '改ざん')").run();
  await expect(exportPublishedEvents(fixture.db)).rejects.toThrow('invalid_publication_hash');
});

test('local read endpoint is no-store, rejects nonlocal hosts and is absent from authenticated production routes', async () => {
  const response = await fixture.runtime.dispatchFetch('http://localhost/api/local/published-events');
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ schemaVersion: 'cms-events/v1', events: [], filmTags: [], eventTags: [] });
  expect(response.headers.get('cache-control')).toBe('no-store');
  expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
  expect((await fixture.runtime.dispatchFetch('http://example.com/api/local/published-events')).status).toBe(403);
  expect((await fixture.runtime.dispatchFetch('http://localhost/api/local/published-events', { method: 'POST' })).status).toBe(405);
  await expect(handleAuthenticated(new Request('http://localhost/api/local/published-events'), { DB: fixture.db },
    { id: 'editor', email: 'editor@localhost', name: 'Editor' }, 'http://localhost')).rejects.toMatchObject({ status: 404 });
});
