import { readFile } from 'node:fs/promises';
import { unstable_splitSqlQuery } from 'wrangler';
import { beforeEach, afterEach, expect, test } from 'vitest';
import { createWorkerFixture } from '../src/testing/fixtures';
import { emptyDraft } from '../src/features/events/draft';
let fixture: Awaited<ReturnType<typeof createWorkerFixture>>;
beforeEach(async () => {
  fixture = await createWorkerFixture('local');
  for (const file of ['0001_content_drafts.sql', '0002_tags.sql']) {
    const sql = await readFile(new URL(`../migrations/${file}`, import.meta.url), 'utf8');
    await fixture.db.batch(unstable_splitSqlQuery(sql).map((statement) => fixture.db.prepare(statement)));
  }
});
afterEach(async () => { await fixture?.dispose(); });
function request(path: string, method = 'GET', body?: unknown) {
  return fixture.runtime.dispatchFetch('http://localhost' + path, { method,
    headers: { Origin: 'http://127.0.0.1:5174', 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
const create = (payload = emptyDraft(), operationId = crypto.randomUUID()) => request('/api/contents', 'POST', { type: 'event', operationId, payload });
test('create, retrieve and update retain invalid and hidden inputs', async () => {
  const payload = { ...emptyDraft(), startDate: '2026/1', endDate: '不正', venue: '保持', multiDay: false };
  const created = await create(payload); expect(created.status).toBe(201);
  const saved = await created.json() as any;
  expect((await (await request(`/api/contents/${saved.id}`)).json() as any).payload).toEqual(payload);
  const changed = await request(`/api/contents/${saved.id}`, 'PUT', { operationId: crypto.randomUUID(), expectedVersion: 1, payload: { ...payload, title: '編集後' } });
  expect(changed.status).toBe(200);
  expect((await changed.json() as any).version).toBe(2);
});
test('rejects invalid payload, size and unknown tags without creating records', async () => {
  expect((await create({ ...emptyDraft(), title: 'a'.repeat(201) })).status).toBe(422);
  expect((await create({ ...emptyDraft(), notes: 'a'.repeat(300000) })).status).toBe(413);
  expect((await create({ ...emptyDraft(), filmTagIds: ['unknown'] })).status).toBe(422);
  expect((await (await request('/api/contents?type=event')).json() as any).count).toBe(0);
});
test('search matches text but not tag names, with stable twenty-item pages', async () => {
  const tags = await (await request('/api/tags')).json() as any;
  for (let i = 0; i < 21; i++) expect((await create({ ...emptyDraft(), title: `記事 ${i}`, venueNotes: i === 1 ? '検索語' : '', filmTagIds: [tags.filmTags[0].id] })).status).toBe(201);
  const page1 = await (await request('/api/contents?type=event')).json() as any;
  const page2 = await (await request('/api/contents?type=event&page=2')).json() as any;
  expect(page1.items).toHaveLength(20); expect(page2.items).toHaveLength(1);
  expect(new Set([...page1.items, ...page2.items].map((item: any) => item.id)).size).toBe(21);
  expect((await (await request('/api/contents?type=event&q=' + encodeURIComponent('検索語'))).json() as any).count).toBe(1);
  expect((await (await request('/api/contents?type=event&q=' + encodeURIComponent(tags.filmTags[0].name))).json() as any).count).toBe(0);
});
test('identical creation retry returns same id and changed replay is rejected', async () => {
  const id = crypto.randomUUID(); const a = await (await create(emptyDraft(), id)).json();
  expect(await (await create(emptyDraft(), id)).json()).toEqual(a);
  expect((await create({ ...emptyDraft(), title: 'different' }, id)).status).toBe(409);
});
