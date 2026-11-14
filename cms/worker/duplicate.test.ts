import { readFile } from 'node:fs/promises';
import { unstable_splitSqlQuery } from 'wrangler';
import { beforeEach, afterEach, expect, test } from 'vitest';
import { createWorkerFixture } from '../src/testing/fixtures';
import { ContentDraftRepository, DraftConflict } from './repositories/content-drafts';
import { emptyDraft } from '../src/features/events/draft';
let fixture: Awaited<ReturnType<typeof createWorkerFixture>>;
beforeEach(async () => {
  fixture = await createWorkerFixture('local');
  for (const file of ['0001_content_drafts.sql', '0002_tags.sql', '0003_duplicate.sql']) {
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
async function source() {
  return await (await request('/api/contents', 'POST', { type: 'event', operationId: crypto.randomUUID(),
    payload: { ...emptyDraft(), title: '元の記事', startDate: '2026/1', endDate: '保持', venue: '非表示でも保持', formats: ['online'], status: 'cancelled' },
  })).json() as any;
}
test('copies only content into a new draft and leaves source unchanged', async () => {
  const original = await source();
  const result = await request(`/api/contents/${original.id}/duplicate`, 'POST', { operationId: crypto.randomUUID(), expectedVersion: 1 });
  expect(result.status).toBe(201);
  const copy = await result.json() as any;
  expect(copy.id).not.toBe(original.id); expect(copy.version).toBe(1);
  expect(copy.payload).toEqual(original.payload);
  expect(copy.createdBy).toBe('local-editor');
  expect(await (await request(`/api/contents/${original.id}`)).json()).toEqual(original);
  expect(await fixture.db.prepare('SELECT copied_from_id FROM content_drafts WHERE id = ?').bind(copy.id).first('copied_from_id')).toBe(original.id);
});
test('concurrent retries and response loss create one copy, even if source later changes', async () => {
  const original = await source(); const body = { operationId: crypto.randomUUID(), expectedVersion: 1 };
  const path = `/api/contents/${original.id}/duplicate`;
  const responses = await Promise.all([request(path, 'POST', body), request(path, 'POST', body)]);
  expect(responses.map(r => r.status)).toEqual([201, 201]);
  const [a,b] = await Promise.all(responses.map(r => r.json())); expect(a).toEqual(b);
  await request(`/api/contents/${original.id}`, 'PUT', { operationId: crypto.randomUUID(), expectedVersion: 1, payload: { ...original.payload, title: '変更' } });
  expect(await (await request(path, 'POST', body)).json()).toEqual(a);
  expect((await request(path, 'POST', { ...body, expectedVersion: 2 })).status).toBe(409);
  expect(await fixture.db.prepare('SELECT count(*) AS count FROM content_drafts').first('count')).toBe(2);
});
test('rejects missing, stale, malformed and cross-origin requests without copies', async () => {
  const original = await source();
  const path = `/api/contents/${original.id}/duplicate`; const body = { operationId: crypto.randomUUID(), expectedVersion: 2 };
  expect((await request(path, 'POST', body)).status).toBe(409);
  expect((await request(`/api/contents/${crypto.randomUUID()}/duplicate`, 'POST', body)).status).toBe(404);
  expect((await request(path, 'POST', { ...body, payload: original.payload })).status).toBe(422);
  expect((await fixture.runtime.dispatchFetch('http://localhost'+path, { method: 'POST', headers: { Origin: 'https://elsewhere.test', 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).status).toBe(403);
  expect(await fixture.db.prepare('SELECT count(*) AS count FROM content_drafts').first('count')).toBe(1);
});
test('database failure rolls back the copy and its retry record', async () => {
  const original = await source();
  await fixture.db.exec("CREATE TRIGGER fail_copy BEFORE INSERT ON content_drafts BEGIN SELECT RAISE(ABORT, 'test_failure'); END;");
  expect((await request(`/api/contents/${original.id}/duplicate`, 'POST', { operationId: crypto.randomUUID(), expectedVersion: 1 })).status).toBe(503);
  expect(await fixture.db.prepare('SELECT count(*) AS count FROM content_drafts').first('count')).toBe(1);
  expect(await fixture.db.prepare('SELECT count(*) AS count FROM draft_operations').first('count')).toBe(1);
});

test('source changes between read and insert are rejected atomically', async () => {
  const original = await source();
  const repository = new ContentDraftRepository({ prepare(sql: string) {
    if (!sql.startsWith('INSERT INTO draft_operations')) return fixture.db.prepare(sql);
    return { bind(...values: unknown[]) {
      const statement = fixture.db.prepare(sql).bind(...values);
      return { ...statement, async run() {
        await fixture.db.prepare('UPDATE content_drafts SET version = version + 1 WHERE id = ?').bind(original.id).run();
        return statement.run();
      } };
    } } as any;
  } });
  await expect(repository.duplicate({ actor: 'local-editor', sourceId: original.id, expectedVersion: 1,
    operationId: crypto.randomUUID() })).rejects.toBeInstanceOf(DraftConflict);
  expect(await fixture.db.prepare('SELECT count(*) AS count FROM content_drafts').first('count')).toBe(1);
  expect(await fixture.db.prepare('SELECT count(*) AS count FROM draft_operations').first('count')).toBe(1);
});

test('does not inherit a custom slug when duplicating', async () => {
  const original = await source();
  await request(`/api/contents/${original.id}`, 'PUT', { operationId: crypto.randomUUID(), expectedVersion: 1, payload: { ...original.payload, slug: 'custom-event' } });
  const result = await request(`/api/contents/${original.id}/duplicate`, 'POST', { operationId: crypto.randomUUID(), expectedVersion: 2 });
  expect(result.status).toBe(201);
  expect((await result.json() as any).payload).not.toHaveProperty('slug');
  expect((await (await request(`/api/contents/${original.id}`)).json() as any).payload.slug).toBe('custom-event');
});
