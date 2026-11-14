import { readFile } from 'node:fs/promises';
import { unstable_splitSqlQuery } from 'wrangler';
import { beforeEach, afterEach, expect, test } from 'vitest';
import { createWorkerFixture } from '../src/testing/fixtures';
import { emptyDraft } from '../src/features/events/draft';
import { publication } from './routes/publication';
import { ContentDraftRepository } from './repositories/content-drafts';
import { PublicationService, type Delivery, type PublicationDelivery } from './services/publication';
let fixture: Awaited<ReturnType<typeof createWorkerFixture>>;
beforeEach(async () => {
  fixture = await createWorkerFixture();
  for (const file of ['0001_content_drafts', '0002_tags', '0003_duplicate', '0004_publication_history', '0005_restore', '0006_history_names', '0007_publication_urls']) {
    await fixture.db.batch(unstable_splitSqlQuery(await readFile(new URL(`../migrations/${file}.sql`, import.meta.url), 'utf8')).map(s => fixture.db.prepare(s)));
  }
});
afterEach(async () => { await fixture?.dispose(); });
const actor = { id: 'editor', name: '編集者', email: 'editor@example.test' };
const response = (d: Delivery) => ({ status: 'succeeded' as const, operationId: d.operationId, attempt: d.attempt, hash: d.hash, receipt: 'test-receipt' });
const adapter: PublicationDelivery = { deploy: async () => ({ status: 'unknown' }), inspect: async d => response(d) };
const call = (id: string, body?: unknown, delivery?: PublicationDelivery) => publication(new Request(`http://localhost/api/contents/${id}/publication`, body ? { method: 'POST', body: JSON.stringify(body) } : {}), fixture.db, actor, id, delivery);
test('publication API validates, resumes accepted delivery, and exposes only confirmed URLs', async () => {
  const drafts = new ContentDraftRepository(fixture.db);
  let saved = await drafts.save({ actor: actor.id, operationId: crypto.randomUUID(), payload: emptyDraft() });
  const body = { operationId: crypto.randomUUID(), expectedVersion: 1, expectedPublicationVersion: 0 };
  expect((await call(saved.id, body, adapter)).status).toBe(422);
  saved = await drafts.save({ actor: actor.id, operationId: crypto.randomUUID(), payload: { ...emptyDraft(), title: '公開', startDate: '2026/12/30', venue: '会場' }, target: { id: saved.id, expectedVersion: 1 } });
  body.expectedVersion = 2;
  expect((await (await call(saved.id, body, adapter)).json()).state).toBe('unknown');
  const current = await (await call(saved.id, undefined, adapter)).json();
  expect(current).toMatchObject({ published: true, version: 1, operation: { state: 'succeeded' } });
  expect(current.url).toBe(`http://127.0.0.1:4327/events/${saved.id}/`);
  expect((await (await call(saved.id, body, adapter)).json()).state).toBe('succeeded');
  expect(await fixture.db.prepare('SELECT COUNT(*) AS n FROM publication_revisions').first('n')).toBe(1);
});
test('unconfigured deployment and stale versions never start publication', async () => {
  const saved = await new ContentDraftRepository(fixture.db).save({ actor: actor.id, operationId: crypto.randomUUID(), payload: { ...emptyDraft(), title: '公開', startDate: '2026/12/30', venue: '会場' } });
  const body = { operationId: crypto.randomUUID(), expectedVersion: 2, expectedPublicationVersion: 0 };
  await expect(call(saved.id, body)).rejects.toMatchObject({ status: 503 });
  await expect(call(saved.id, body, adapter)).rejects.toMatchObject({ status: 409 });
  expect(await fixture.db.prepare('SELECT COUNT(*) AS n FROM publication_operations').first('n')).toBe(0);
});

test('a saved request resumes after interruption before dispatch', async () => {
  const draft = await new ContentDraftRepository(fixture.db).save({ actor: actor.id, operationId: crypto.randomUUID(), payload: { ...emptyDraft(), title: '再開', startDate: '2026/12/30', venue: '会場' } });
  await new PublicationService(fixture.db).prepare({ actor: actor.id, operationId: crypto.randomUUID(), contentId: draft.id, expectedVersion: 1, expectedPublicationVersion: 0 });
  const resumed = await (await call(draft.id, undefined, { deploy: async d => response(d), inspect: async () => { throw new Error('must dispatch ready request'); } })).json();
  expect(resumed).toMatchObject({ published: true, version: 1, operation: { state: 'succeeded' } });
});
