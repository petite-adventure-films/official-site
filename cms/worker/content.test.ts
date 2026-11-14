import { readFile } from 'node:fs/promises';
import { unstable_splitSqlQuery } from 'wrangler';
import { beforeEach, afterEach, expect, test } from 'vitest';
import { createWorkerFixture } from '../src/testing/fixtures';
import { emptyDraft } from '../src/features/events/draft';
let fixture: Awaited<ReturnType<typeof createWorkerFixture>>;
beforeEach(async () => {
  fixture = await createWorkerFixture('local');
  for (const file of ['0001_content_drafts.sql', '0002_tags.sql', '0003_duplicate.sql', '0004_publication_history.sql', '0005_restore.sql', '0006_history_names.sql', '0007_publication_urls.sql']) {
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

test('optional slug preserves old drafts and incomplete custom values verbatim', async () => {
  const old = await (await create()).json() as any;
  expect(old.payload).not.toHaveProperty('slug');
  const payload = { ...old.payload, slug: '途中 / 入力' };
  const response = await request(`/api/contents/${old.id}`, 'PUT', { operationId: crypto.randomUUID(), expectedVersion: 1, payload });
  expect(response.status).toBe(200);
  expect((await (await request(`/api/contents/${old.id}`)).json() as any).payload.slug).toBe(payload.slug);
});

test('publication check reports fields without writing drafts or operation records', async () => {
  const saved = await (await create()).json() as any;
  const operations = await fixture.db.prepare('SELECT count(*) AS count FROM draft_operations').first('count');
  const path = `/api/contents/${saved.id}/check-publication`;
  const response = await request(path, 'POST', { expectedVersion: saved.version });
  expect(response.status).toBe(200); expect(response.headers.get('Cache-Control')).toBe('no-store');
  expect(await response.json()).toMatchObject({ ok: false, version: 1, issues: [
    { field: 'title' }, { field: 'startDate' }, { field: 'venue' },
  ] });
  expect(await (await request(`/api/contents/${saved.id}`)).json()).toEqual(saved);
  expect(await fixture.db.prepare('SELECT count(*) AS count FROM draft_operations').first('count')).toBe(operations);
  expect((await request(path, 'POST', { expectedVersion: 2 })).status).toBe(409);
  expect((await request(path, 'POST', { expectedVersion: 1, payload: saved.payload })).status).toBe(422);
  expect((await request(`/api/contents/${crypto.randomUUID()}/check-publication`, 'POST', { expectedVersion: 1 })).status).toBe(404);
});
test('publication check uses current tags and returns no publishable payload', async () => {
  const available = await (await request('/api/tags')).json() as any;
  const saved = await (await create({ ...emptyDraft(), title: '上映会', startDate: '2026-12-30', formats: ['online'], filmTagIds: [available.filmTags[0].id] })).json() as any;
  const path = `/api/contents/${saved.id}/check-publication`;
  expect(await (await request(path, 'POST', { expectedVersion: 1 })).json()).toEqual({ ok: true, version: 1 });
  await fixture.db.prepare("DELETE FROM tags WHERE kind = 'film' AND id = ?").bind(available.filmTags[0].id).run();
  expect(await (await request(path, 'POST', { expectedVersion: 1 })).json()).toMatchObject({ ok: false, issues: [{ field: 'filmTagIds', code: 'unknown_tag' }] });
  expect((await fixture.runtime.dispatchFetch('http://localhost'+path, { method: 'POST', headers: { Origin: 'https://other.test', 'Content-Type': 'application/json' }, body: JSON.stringify({ expectedVersion: 1 }) })).status).toBe(403);
});

test('URL conflict joins other field errors, preserves the saved draft and never reserves URLs', async () => {
  const saved = await (await create({ ...emptyDraft(), slug: '18010' })).json() as any;
  const before = await fixture.db.prepare('SELECT * FROM event_url_owners ORDER BY slug').all();
  const response = await request(`/api/contents/${saved.id}/check-publication`, 'POST', { expectedVersion: 1 });
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({ ok: false, issues: expect.arrayContaining([
    { field: 'title', code: 'required', message: expect.any(String) },
    { field: 'slug', code: 'url_reserved', message: 'このURLは使用されています。別のslugを入力してください。' },
  ]) });
  expect(await (await request(`/api/contents/${saved.id}`)).json()).toEqual(saved);
  expect((await fixture.db.prepare('SELECT * FROM event_url_owners ORDER BY slug').all()).results).toEqual(before.results);
  expect(await fixture.db.prepare('SELECT count(*) AS count FROM publication_operations').first('count')).toBe(0);
});
test('URL check allows this article’s current and past URLs but rejects another owner and does not lock a free URL', async () => {
  const valid = { ...emptyDraft(), title: '上映会', startDate: '2026-12-30', formats: ['online'] as ('online')[], slug: 'current' };
  const saved = await (await create(valid)).json() as any;
  await fixture.db.prepare("INSERT INTO event_url_owners(slug, content_id, origin) VALUES ('current', ?, 'cms'), ('past', ?, 'cms'), ('other', 'another-article', 'cms')")
    .bind(saved.id, saved.id).run();
  let version = 1;
  for (const [slug, ok] of [['current', true], ['past', true], ['other', false], ['free', true]] as const) {
    if (slug !== 'current') {
      await request(`/api/contents/${saved.id}`, 'PUT', { operationId: crypto.randomUUID(), expectedVersion: version, payload: { ...valid, slug } });
      version++;
    }
    const checked = await (await request(`/api/contents/${saved.id}/check-publication`, 'POST', { expectedVersion: version })).json() as any;
    expect(checked.ok).toBe(ok);
    if (!ok) expect(checked.issues).toEqual([{ field: 'slug', code: 'url_reserved', message: expect.any(String) }]);
  }
  expect(await fixture.db.prepare("SELECT * FROM event_url_owners WHERE slug = 'free'").first()).toBeNull();
});
test('URL storage failure is not reported as a duplicate or a successful check', async () => {
  const saved = await (await create({ ...emptyDraft(), title: '上映会', startDate: '2026-12-30', formats: ['online'] })).json() as any;
  await fixture.db.exec('DROP TABLE event_canonical_urls');
  await fixture.db.exec('DROP TABLE event_url_owners');
  const response = await request(`/api/contents/${saved.id}/check-publication`, 'POST', { expectedVersion: 1 });
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({ error: 'unavailable' });
});
