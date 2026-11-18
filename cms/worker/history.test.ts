import { prepareBlogPublication } from './blog-publication';
import { readFile } from 'node:fs/promises';
import { unstable_splitSqlQuery } from 'wrangler';
import { beforeEach, afterEach, expect, test } from 'vitest';
import { emptyBlogDraft } from '../src/features/blog/draft';
import { createWorkerFixture } from '../src/testing/fixtures';
let fixture: Awaited<ReturnType<typeof createWorkerFixture>>;
const id = '00000000-0000-4000-8000-000000000001';
beforeEach(async () => {
  fixture = await createWorkerFixture('local');
  for (const name of ['0001_content_drafts', '0002_tags', '0003_duplicate', '0004_publication_history', '0005_restore', '0006_history_names', '0007_publication_urls', '0008_blog_drafts', '0009_media_uploads']) {
    const sql = await readFile(new URL(`../migrations/${name}.sql`, import.meta.url), 'utf8');
    await fixture.db.batch(unstable_splitSqlQuery(sql).map(s => fixture.db.prepare(s)));
  }
  const seed = await readFile(new URL('../e2e/history-fixtures.sql', import.meta.url), 'utf8');
  await fixture.db.batch(unstable_splitSqlQuery(seed).map(s => fixture.db.prepare(s)));
});
afterEach(async () => { await fixture?.dispose(); });
function request(action: string, body?: unknown, origin = 'http://127.0.0.1:5174', contentId = id) {
  return fixture.runtime.dispatchFetch(`http://localhost/api/contents/${contentId}/${action}`, { method: body ? 'POST' : 'GET',
    headers: { Origin: origin, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
}
test('history is read-only and restores with verified display name and idempotent response', async () => {
  const response = await request('history');
  expect(response.headers.get('Cache-Control')).toBe('no-store');
  const data = await response.json() as any;
  expect(data.version).toBe(1); expect(data.items).toHaveLength(3);
  expect(data.items[0]).toMatchObject({ actorName: '開発用ユーザー', payload: { title: '上映会のお知らせ 3' } });
  expect(data.items[0]).not.toHaveProperty('actor');
  const input = { operationId: crypto.randomUUID(), expectedVersion: 1, sourceKind: 'publication', sourceId: data.items[1].id };
  const restored = await (await request('restore', input)).json();
  expect(restored).toMatchObject({ version: 2, payload: { title: '上映会のお知らせ 2' } });
  expect(await (await request('restore', input)).json()).toEqual(restored);
  const history = await (await request('history')).json() as any;
  expect(history.items[0]).toMatchObject({ kind: 'protectedDraft', actorName: '開発用ユーザー', payload: { title: '履歴テストの下書き' } });
  expect((await request('restore', { ...input, operationId: crypto.randomUUID() })).status).toBe(409);
});
test('rejects forged identity, extra payload, other-origin mutations and wrong source', async () => {
  const data = await (await request('history')).json() as any;
  const input = { operationId: crypto.randomUUID(), expectedVersion: 1, sourceKind: 'publication', sourceId: data.items[0].id };
  expect((await request('restore', { ...input, actorName: '偽名' })).status).toBe(422);
  expect((await request('restore', { ...input, payload: {} })).status).toBe(422);
  expect((await request('restore', input, 'https://other.example')).status).toBe(403);
  expect((await request('restore', { ...input, sourceId: '10000000-0000-4000-8000-000000000023' })).status).toBe(404);
  expect((await (await request('history')).json() as any).version).toBe(1);
});

test('blog history validates protected snapshots and restores without enabling publication', async () => {
  const current = { ...emptyBlogDraft(), title: '現在のブログ' };
  const created = await fixture.runtime.dispatchFetch('http://localhost/api/contents', {
    method: 'POST',
    headers: { Origin: 'http://127.0.0.1:5174', 'Content-Type': 'application/json' },
    body: JSON.stringify({ operationId: crypto.randomUUID(), type: 'blog', payload: current }),
  });
  expect(created.status).toBe(201);
  const blog = await created.json() as { id: string };
  const sourceId = crypto.randomUUID();
  const snapshot = { ...current, title: '以前のブログ' };
  const call = (action: string, body?: unknown) => request(action, body, undefined, blog.id);
  const input = { operationId: crypto.randomUUID(), expectedVersion: 1, sourceKind: 'protectedDraft', sourceId };
  await fixture.db.prepare(`INSERT INTO protected_drafts (content_id, id, payload_schema_version, payload, protected_at, protected_by)
    VALUES (?, ?, ?, ?, ?, ?)`).bind(blog.id, sourceId, 'event-draft/v1', JSON.stringify(snapshot), new Date().toISOString(), 'fixture').run();
  expect((await call('history')).status).toBe(422);
  expect((await call('restore', input)).status).toBe(422);

  const setSnapshot = (payload: typeof snapshot) => fixture.db.prepare(
    "UPDATE protected_drafts SET payload_schema_version = 'blog-draft/v1', payload = ? WHERE id = ?",
  ).bind(JSON.stringify(payload), sourceId).run();
  await setSnapshot({ ...snapshot, body: { schemaVersion: 2, doc: { type: 'doc', content: [
    { type: 'assetImage', attrs: { assetId: crypto.randomUUID(), alt: '画像' } },
  ] } } });
  expect((await call('history')).status).toBe(422);
  expect((await call('restore', input)).status).toBe(422);

  await setSnapshot(snapshot);
  expect(await (await call('history')).json()).toMatchObject({ version: 1, items: [{ id: sourceId, payload: snapshot }] });
  const restored = await call('restore', input);
  expect(restored.status).toBe(200);
  const result = await restored.json();
  expect(result).toMatchObject({ version: 2, payload: snapshot });
  expect(await (await call('restore', input)).json()).toEqual(result);
  expect(await (await call('history')).json()).toMatchObject({ version: 2, items: [{ payload: current }] });
  const publishedDraft = { ...snapshot, title: '公開したブログ', slug: 'published-blog' };
  const candidate = await prepareBlogPublication(fixture.db, publishedDraft);
  publishedDraft.title = '候補固定後の入力';
  const revisionId = crypto.randomUUID();
  const json = JSON.stringify(candidate);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(json));
  const hash = Buffer.from(digest).toString('hex');
  await fixture.db.batch([
    fixture.db.prepare(`INSERT INTO publication_revisions (id, content_id, version, payload, content_hash, published_at, published_by)
      VALUES (?, ?, 1, ?, ?, ?, ?)`).bind(revisionId, blog.id, json, hash, new Date().toISOString(), 'fixture'),
    fixture.db.prepare('INSERT INTO publication_state (content_id, version, revision_id, content_hash) VALUES (?, 1, ?, ?)')
      .bind(blog.id, revisionId, hash),
  ]);
  const listing = await (await call('history')).json();
  expect(listing).toMatchObject({ items: [{ kind: 'protectedDraft' }, { id: revisionId, payload: { title: '公開したブログ' } }] });
  const fromPublication = await call('restore', {
    operationId: crypto.randomUUID(), expectedVersion: 2, sourceKind: 'publication', sourceId: revisionId,
  });
  expect(await fromPublication.json()).toMatchObject({ version: 3, payload: candidate.content });
  expect(await fixture.db.prepare('SELECT version, revision_id FROM publication_state WHERE content_id = ?')
    .bind(blog.id).first()).toEqual({ version: 1, revision_id: revisionId });
});
