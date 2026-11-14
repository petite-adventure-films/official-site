import { readFile } from 'node:fs/promises';
import { unstable_splitSqlQuery } from 'wrangler';
import { beforeEach, afterEach, expect, test } from 'vitest';
import { createWorkerFixture } from '../src/testing/fixtures';
let fixture: Awaited<ReturnType<typeof createWorkerFixture>>;
const id = '00000000-0000-4000-8000-000000000001';
beforeEach(async () => {
  fixture = await createWorkerFixture('local');
  for (const name of ['0001_content_drafts', '0002_tags', '0003_duplicate', '0004_publication_history', '0005_restore', '0006_history_names']) {
    const sql = await readFile(new URL(`../migrations/${name}.sql`, import.meta.url), 'utf8');
    await fixture.db.batch(unstable_splitSqlQuery(sql).map(s => fixture.db.prepare(s)));
  }
  const seed = await readFile(new URL('../e2e/history-fixtures.sql', import.meta.url), 'utf8');
  await fixture.db.batch(unstable_splitSqlQuery(seed).map(s => fixture.db.prepare(s)));
});
afterEach(async () => { await fixture?.dispose(); });
function request(action: string, body?: unknown, origin = 'http://127.0.0.1:5174') {
  return fixture.runtime.dispatchFetch(`http://localhost/api/contents/${id}/${action}`, { method: body ? 'POST' : 'GET',
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
