import { readFile, readdir } from 'node:fs/promises';
import { unstable_splitSqlQuery } from 'wrangler';
import { beforeEach, afterEach, expect, test } from 'vitest';
import { createWorkerFixture } from '../src/testing/fixtures';
import { articleTypes, emptyArticleDraft } from '../src/features/articles/draft';
import { emptyBlogDraft } from '../src/features/blog/draft';
import { validateArticleDraft } from './article-draft';
let fixture: Awaited<ReturnType<typeof createWorkerFixture>>;
const migrations = new URL('../migrations/', import.meta.url);
async function apply(f: typeof fixture, name: string) {
  await f.db.batch(unstable_splitSqlQuery(await readFile(new URL(name, migrations), 'utf8')).map(sql => f.db.prepare(sql)));
}
beforeEach(async () => {
  fixture = await createWorkerFixture('local');
  for (const name of (await readdir(migrations)).filter(n => n.endsWith('.sql')).sort()) await apply(fixture, name);
});
afterEach(async () => { await fixture?.dispose(); });
const request = (path: string, method = 'GET', body?: unknown) => fixture.runtime.dispatchFetch('http://localhost' + path, {
  method, headers: { Origin: 'http://127.0.0.1:5174', 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}),
});
const create = (type: string, payload: unknown, operationId = crypto.randomUUID()) => request('/api/contents', 'POST', { type, payload, operationId });

test.each(articleTypes)('%s keeps empty drafts, edits, replays, duplicates, and rejects stale or cross-type writes', async type => {
  const payload = emptyArticleDraft(type), operationId = crypto.randomUUID();
  const response = await create(type, payload, operationId);
  expect(response.status).toBe(201);
  const saved = await response.json() as any;
  expect(saved).toMatchObject({ type, payloadSchemaVersion: `${type}-draft/v1`, version: 1, payload });
  const changed = { ...payload, title: '再編集', slug: 'review' };
  const path = `/api/contents/${saved.id}`;
  expect((await request(path, 'PUT', { operationId: crypto.randomUUID(), expectedVersion: 1, payload: changed })).status).toBe(200);
  expect(await (await create(type, payload, operationId)).json()).toEqual(saved);
  expect((await create('blog', emptyBlogDraft(), operationId)).status).toBe(409);
  expect((await request(path, 'PUT', { operationId: crypto.randomUUID(), expectedVersion: 1, payload: changed })).status).toBe(409);
  expect((await request(path, 'PUT', { operationId: crypto.randomUUID(), expectedVersion: 2, payload: emptyBlogDraft() })).status).toBe(422);
  const duplicated = await request(path + '/duplicate', 'POST', { operationId: crypto.randomUUID(), expectedVersion: 2 });
  expect(duplicated.status).toBe(201);
  expect(await duplicated.json()).toMatchObject({ type, payload: { ...payload, title: '再編集' } });
  expect((await (await request(path)).json() as any).payload).toEqual(changed);
});

test('validates each shape and references without silently dropping fields', async () => {
  for (const type of articleTypes) {
    expect(validateArticleDraft(type, emptyArticleDraft(type))).toBe(true);
    expect((await create(type, { ...emptyArticleDraft(type), unexpected: 'keep me' })).status).toBe(422);
    expect((await create(type, { ...emptyArticleDraft(type), filmTagIds: ['unknown'] })).status).toBe(422);
  }
  expect((await create('pressCoverage', { ...emptyArticleDraft('pressCoverage'), attachmentAssetIds: ['asset_' + 'f'.repeat(32)] })).status).toBe(422);
  const incomplete = { ...emptyArticleDraft('video'), youtubeId: '途中', productionYear: '202', duration: '62:32' };
  expect((await create('video', incomplete)).status).toBe(201);
  const malicious = { ...emptyArticleDraft('news'), body: { schemaVersion: 2, doc: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '危険', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }] }] }] } } };
  expect((await create('news', malicious)).status).toBe(422);
});

test('isolates article types and searches readable body text', async () => {
  for (const type of articleTypes) await create(type, { ...emptyArticleDraft(type), title: type, body: { schemaVersion: 2, doc: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '本文' }, { type: 'text', text: '検索' }] }] } } });
  for (const type of articleTypes) {
    expect(await (await request(`/api/contents?type=${type}&q=${encodeURIComponent('本文検索')}`)).json()).toMatchObject({ count: 1, total: 1, items: [expect.objectContaining({ type })] });
  }
});

test('migration retains event/blog rows, operations and history and keeps foreign keys valid', async () => {
  const old = await createWorkerFixture('local');
  try {
    for (const name of (await readdir(migrations)).filter(n => n.endsWith('.sql') && n < '0011').sort()) await apply(old, name);
    await old.db.batch(unstable_splitSqlQuery(await readFile(new URL('../e2e/history-fixtures.sql', import.meta.url), 'utf8')).map(sql => old.db.prepare(sql)));
    await old.runtime.dispatchFetch('http://localhost/api/contents', { method: 'POST', headers: { Origin: 'http://127.0.0.1:5174', 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'blog', operationId: crypto.randomUUID(), payload: emptyBlogDraft() }) });
    const tables = ['content_drafts', 'draft_operations', 'publication_operations', 'publication_revisions', 'publication_state', 'protected_drafts', 'restore_operations', 'event_canonical_urls'];
    const snapshot = async () => Promise.all(tables.map(async t => (await old.db.prepare(`SELECT * FROM ${t} ORDER BY rowid`).all()).results));
    const before = await snapshot();
    const oldOwners = (await old.db.prepare('SELECT * FROM event_url_owners').all()).results;
    await apply(old, '0011_article_drafts.sql');
    expect(await snapshot()).toEqual(before);
    expect((await old.db.prepare('SELECT * FROM event_url_owners').all()).results).toEqual(expect.arrayContaining(oldOwners));
    expect((await old.db.prepare('PRAGMA foreign_key_check').all()).results).toEqual([]);
  } finally { await old.dispose(); }
});

test.each(articleTypes)('%s publishes atomically, preserves a failed release, restores and re-edits', async type => {
  const { ContentDraftRepository } = await import('./repositories/content-drafts');
  const { PublicationService } = await import('./services/publication');
  const { RestoreService } = await import('./services/restore');
  const { buildPublicationManifest } = await import('./services/publication-manifest');
  const drafts = new ContentDraftRepository(fixture.db), service = new PublicationService(fixture.db), restore = new RestoreService(fixture.db);
  const payload = { ...emptyArticleDraft(type), title: '公開内容', slug: 'review-first', ...(type === 'video' ? { youtubeId: 'kwHsbFrH2EA', productionYear: '2025', productionCountry: '日本', duration: '62:32' } : {}) };
  const saved = await drafts.save({ actor: 'test', type, payload, operationId: crypto.randomUUID() });
  const prepare = async () => service.prepare({ actor: 'test', contentId: saved.id, operationId: crypto.randomUUID(), expectedVersion: (await drafts.get(saved.id))!.version, expectedPublicationVersion: (await service.current(saved.id))?.version ?? 0 }, true);
  const op = await prepare();
  let manifest: any;
  const confirm = async (delivery: import('./services/publication').Delivery) => {
    manifest = await buildPublicationManifest(fixture.db, undefined, delivery);
    expect(await service.current(saved.id)).toBeNull();
    expect(await service.history(saved.id)).toHaveLength(0);
    return { status: 'succeeded' as const, operationId: delivery.operationId, attempt: delivery.attempt, hash: delivery.hash, receipt: 'local-test-receipt' };
  };
  await service.deliver(op.id, { supportsLocalBlog: true, deploy: confirm, inspect: confirm });
  expect(manifest.articles).toHaveLength(1);
  expect(manifest.articles[0]).toMatchObject({ type, content: payload });
  const state = await service.current(saved.id), history = await service.history(saved.id);
  expect(state?.version).toBe(1); expect(history).toHaveLength(1);
  const edited = await drafts.save({ actor: 'test', operationId: crypto.randomUUID(), target: { id: saved.id, expectedVersion: 1 }, payload: { ...payload, title: '再編集' } });
  const failed = await prepare();
  const fail = async (d: import('./services/publication').Delivery) => ({ status: 'failed' as const, operationId: d.operationId, attempt: d.attempt, hash: d.hash, receipt: 'local-test-failure' });
  await service.deliver(failed.id, { deploy: fail, inspect: fail });
  expect(await service.current(saved.id)).toEqual(state); expect(await service.history(saved.id)).toEqual(history);
  const restored = await restore.restore({ actor: 'test', operationId: crypto.randomUUID(), contentId: saved.id, expectedVersion: edited.version, sourceKind: 'publication', sourceId: history[0].id });
  expect(restored.payload).toEqual(payload);
  expect((await restore.history(saved.id))[0].payload).toEqual(edited.payload);
  const again = await drafts.save({ actor: 'test', operationId: crypto.randomUUID(), target: { id: saved.id, expectedVersion: restored.version }, payload: { ...payload, title: '復元後の保存' } });
  expect((await drafts.get(saved.id))?.payload).toEqual(again.payload);
  expect(await service.current(saved.id)).toEqual(state);
});

test('new article URLs reject known legacy paths and invalid videos cannot publish', async () => {
  const { ContentDraftRepository } = await import('./repositories/content-drafts');
  const { PublicationService } = await import('./services/publication');
  const drafts = new ContentDraftRepository(fixture.db), service = new PublicationService(fixture.db);
  for (const [type, slug] of [['pressCoverage', '17839'], ['video', '17837']] as const) {
    const saved = await drafts.save({ actor: 'test', type, operationId: crypto.randomUUID(), payload: { ...emptyArticleDraft(type), title: '衝突', slug, ...(type === 'video' ? { youtubeId: 'kwHsbFrH2EA' } : {}) } });
    await expect(service.prepare({ actor: 'test', operationId: crypto.randomUUID(), contentId: saved.id, expectedVersion: 1, expectedPublicationVersion: 0 }, true)).rejects.toThrow('url_reserved');
  }
  const saved = await drafts.save({ actor: 'test', type: 'video', operationId: crypto.randomUUID(), payload: { ...emptyArticleDraft('video'), title: '途中', slug: 'review', youtubeId: '途中' } });
  await expect(service.prepare({ actor: 'test', operationId: crypto.randomUUID(), contentId: saved.id, expectedVersion: 1, expectedPublicationVersion: 0 }, true)).rejects.toThrow('invalid_publication');
  expect(await fixture.db.prepare('SELECT count(*) AS n FROM publication_operations').first('n')).toBe(0);
});

test('news links follow pagination after later publications and match the release manifest', async () => {
  const { ContentDraftRepository } = await import('./repositories/content-drafts');
  const { PublicationService } = await import('./services/publication');
  const { buildPublicationManifest } = await import('./services/publication-manifest');
  const { publication } = await import('./routes/publication');
  const drafts = new ContentDraftRepository(fixture.db), service = new PublicationService(fixture.db);
  const ids: string[] = [];
  const confirm = async (d: import('./services/publication').Delivery) => ({ status: 'succeeded' as const, operationId: d.operationId, attempt: d.attempt, hash: d.hash, receipt: 'pagination-test' });
  const adapter = { supportsLocalBlog: true, localSiteOrigin: 'http://localhost', deploy: confirm, inspect: confirm };
  let manifest: any;
  for (let i = 0; i < 11; i++) {
    const saved = await drafts.save({ actor: 'test', type: 'news', payload: { ...emptyArticleDraft('news'), title: `お知らせ${i}` }, operationId: crypto.randomUUID() });
    ids.push(saved.id);
    const op = await service.prepare({ actor: 'test', contentId: saved.id, operationId: crypto.randomUUID(), expectedVersion: 1, expectedPublicationVersion: 0 }, true);
    await service.deliver(op.id, { ...adapter, deploy: async d => { manifest = await buildPublicationManifest(fixture.db, undefined, d); return confirm(d); } });
  }
  expect(manifest.articles).toHaveLength(11);
  expect(manifest.articles.filter((a: any) => a.path.startsWith('/news/page/2/'))).toHaveLength(1);
  for (const id of ids) {
    const response = await publication(new Request('http://localhost'), fixture.db, { id: 'test', name: 'Test', email: 'test@example.com' }, id, adapter);
    const result = await response.json() as any;
    const entry = manifest.articles.find((a: any) => a.path.endsWith(`#cms-${id}`));
    expect(result.url).toBe('http://localhost' + entry.path);
  }
});
