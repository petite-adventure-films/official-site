import { readFile, readdir } from 'node:fs/promises';
import { unstable_splitSqlQuery } from 'wrangler';
import { beforeEach, afterEach, expect, test } from 'vitest';
import { createWorkerFixture } from '../src/testing/fixtures';
import { emptyBlogDraft } from '../src/features/blog/draft';
import { emptyDraft } from '../src/features/events/draft';
import { validateBlogDraft } from './blog-draft';
import { prepareBlogPublication } from './blog-publication';
let fixture: Awaited<ReturnType<typeof createWorkerFixture>>;
const request = (path: string, method = 'GET', body?: unknown) => fixture.runtime.dispatchFetch('http://localhost' + path, { method, headers: { Origin: 'http://127.0.0.1:5174', 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
const create = (type = 'blog', payload: unknown = emptyBlogDraft(), operationId = crypto.randomUUID()) => request('/api/contents', 'POST', { type, payload, operationId });
beforeEach(async () => {
  fixture = await createWorkerFixture('local');
  for (const file of (await readdir(new URL('../migrations/', import.meta.url))).filter(f => f.endsWith('.sql')).sort()) {
    await fixture.db.batch(unstable_splitSqlQuery(await readFile(new URL(`../migrations/${file}`, import.meta.url), 'utf8')).map(sql => fixture.db.prepare(sql)));
  }
});
afterEach(async () => { await fixture?.dispose(); });
test('blog saves empty/unclassified content, edits, replays and rejects stale updates', async () => {
  const operationId = crypto.randomUUID(); const payload = emptyBlogDraft();
  const response = await create('blog', payload, operationId); expect(response.status).toBe(201);
  const saved = await response.json() as any;
  expect(saved).toMatchObject({ type: 'blog', payloadSchemaVersion: 'blog-draft/v1', version: 1, payload });
  const next = { ...payload, title: '編集後', isRecommended: true };
  expect((await request(`/api/contents/${saved.id}`, 'PUT', { expectedVersion: 1, operationId: crypto.randomUUID(), payload: next })).status).toBe(200);
  expect(await (await create('blog', payload, operationId)).json()).toEqual(saved);
  expect((await create('event', emptyDraft(), operationId)).status).toBe(409);
  expect((await request(`/api/contents/${saved.id}`, 'PUT', { expectedVersion: 1, operationId: crypto.randomUUID(), payload: next })).status).toBe(409);
  expect((await request(`/api/contents/${saved.id}`, 'PUT', { expectedVersion: 2, operationId: crypto.randomUUID(), payload: emptyDraft() })).status).toBe(422);
  expect((await (await request(`/api/contents/${saved.id}`)).json() as any).payload).toEqual(next);
  for (const action of ['publication', 'check-publication', 'restore']) expect((await request(`/api/contents/${saved.id}/${action}`, 'POST', {})).status).toBe(422);
  expect(await (await request(`/api/contents/${saved.id}/publication`)).json()).toMatchObject({ enabled: false, published: false });
});
test('type isolates counts and readable text search, excluding link attributes', async () => {
  await create('event', { ...emptyDraft(), title: 'イベントだけ' });
  await create('blog', { ...emptyBlogDraft(), title: 'ブログだけ', body: { schemaVersion: 2, doc: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '本文', marks: [{ type: 'link', attrs: { href: 'https://example.com/hidden-url' } }] }, { type: 'text', text: '検索語' }] }] } } });
  const list = async (type: string, q = '') => (await (await request(`/api/contents?type=${type}&q=${encodeURIComponent(q)}`)).json()) as any;
  expect(await list('blog')).toMatchObject({ count: 1, total: 1 });expect(await list('event')).toMatchObject({ count: 1, total: 1 });
  expect((await list('blog', '本文検索語')).count).toBe(1);expect((await list('event', '本文検索語')).count).toBe(0);expect((await list('blog', 'hidden-url')).count).toBe(0);
  const categories = await (await request('/api/categories')).json() as any;expect(categories.items).toHaveLength(5);
  expect((await create('blog', { ...emptyBlogDraft(), categoryId: categories.items[0].id })).status).toBe(201);
  expect((await create('blog', { ...emptyBlogDraft(), categoryId: 'unknown' })).status).toBe(422);
});
test('new text validator rejects unknown nodes, archive refs and dangerous links', () => {
  const withNode = (node: any) => ({ ...emptyBlogDraft(), body: { schemaVersion: 2, doc: { type: 'doc', content: [node] } } });
  expect(validateBlogDraft(emptyBlogDraft())).toBe(true);
  expect(validateBlogDraft(withNode({ type: 'image', attrs: { src: 'https://example.com/a.jpg' } }))).toBe(false);
  expect(validateBlogDraft(withNode({ type: 'paragraph', attrs: { sourceRef: 'legacy_' + 'a'.repeat(32) } }))).toBe(false);
  expect(validateBlogDraft(withNode({ type: 'paragraph', content: [{ type: 'text', text: 'link', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }] }] }))).toBe(false);
  expect(validateBlogDraft(withNode({ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '太字', marks: [{ type: 'bold' }] }] }))).toBe(true);
});
test('migration retains existing event operations, publication/history rows and foreign keys', async () => {
  const old = await createWorkerFixture('local');
  try {
    const apply = async (url: URL) => old.db.batch(unstable_splitSqlQuery(await readFile(url, 'utf8')).map(sql => old.db.prepare(sql)));
    for (const name of (await readdir(new URL('../migrations/', import.meta.url))).filter(n => n.endsWith('.sql') && n < '0008').sort()) await apply(new URL(`../migrations/${name}`, import.meta.url));
    await apply(new URL('../e2e/history-fixtures.sql', import.meta.url));
    const tables = ['content_drafts', 'draft_operations', 'publication_operations', 'publication_revisions', 'publication_state', 'protected_drafts', 'restore_operations'];
    const snapshot = async () => Promise.all(tables.map(async t => (await old.db.prepare(`SELECT * FROM ${t} ORDER BY rowid`).all()).results));
    const body = JSON.stringify({ type: 'event', operationId: crypto.randomUUID(), payload: emptyDraft() });
    const post = () => old.runtime.dispatchFetch('http://localhost/api/contents', { method: 'POST', headers: { Origin: 'http://127.0.0.1:5174', 'Content-Type': 'application/json' }, body });
    const original = await (await post()).json();const before = await snapshot();
    await apply(new URL('../migrations/0008_blog_drafts.sql', import.meta.url));
    expect(await snapshot()).toEqual(before);
    expect((await old.db.prepare('PRAGMA foreign_key_check').all()).results).toEqual([]);
    expect(await (await post()).json()).toEqual(original);
  } finally { await old.dispose(); }
});

test('blog duplication preserves body/settings, resets slug, isolates edits and replays one copy', async () => {
  const payload = { ...emptyBlogDraft(), title: 'ブログ原本', slug: 'original-blog', categoryId: '2879', isRecommended: true, isWorkshopReport: true,
    body: { schemaVersion: 2, doc: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '太字本文', marks: [{ type: 'bold' }] }] }] } } };
  const source = await (await create('blog', payload)).json() as any;
  const body = { expectedVersion: source.version, operationId: crypto.randomUUID() };
  const path = `/api/contents/${source.id}/duplicate`;
  const responses = await Promise.all([request(path, 'POST', body), request(path, 'POST', body)]);
  expect(responses.map(r => r.status)).toEqual([201, 201]);
  const [copy, replay] = await Promise.all(responses.map(r => r.json())) as any[];
  expect(copy).toEqual(replay);expect(copy.id).not.toBe(source.id);
  expect(copy).toMatchObject({ type: 'blog', payloadSchemaVersion: 'blog-draft/v1', version: 1 });
  const { slug, ...copiedPayload } = payload;expect(copy.payload).toEqual(copiedPayload);
  expect(await fixture.db.prepare('SELECT copied_from_id FROM content_drafts WHERE id = ?').bind(copy.id).first('copied_from_id')).toBe(source.id);
  expect((await request(`/api/contents/${copy.id}`, 'PUT', { expectedVersion: 1, operationId: crypto.randomUUID(), payload: { ...copy.payload, title: '複製だけ変更' } })).status).toBe(200);
  expect(await (await request(`/api/contents/${source.id}`)).json()).toEqual(source);
  expect((await request(`/api/contents/${source.id}`, 'PUT', { expectedVersion: 1, operationId: crypto.randomUUID(), payload: { ...payload, title: '原本の新しい版' } })).status).toBe(200);
  expect(await (await request(path, 'POST', body)).json()).toEqual(copy);
  expect((await request(path, 'POST', { ...body, operationId: crypto.randomUUID() })).status).toBe(409);
  expect(await fixture.db.prepare("SELECT count(*) AS n FROM content_drafts WHERE type = 'blog'").first('n')).toBe(2);
  expect(await fixture.db.prepare('SELECT count(*) AS n FROM publication_state').first('n')).toBe(0);
});


test('blog publication requires a category and resolves only an untouched URL to the content ID', async () => {
  const payload = { ...emptyBlogDraft(), title: '分類必須の公開' };
  const saved = await (await create('blog', payload)).json() as any;
  await expect(prepareBlogPublication(fixture.db, payload, saved.id)).rejects.toThrow('invalid_blog_publication');
  const classified = { ...payload, categoryId: '2879' };
  const candidate = await prepareBlogPublication(fixture.db, classified, saved.id);
  expect(candidate.content.slug).toBe(saved.id);
  expect(candidate.content.categoryId).toBe('2879');
  await expect(prepareBlogPublication(fixture.db, { ...classified, slug: '' }, saved.id)).rejects.toThrow('invalid_blog_publication');
  const explicit = await prepareBlogPublication(fixture.db, { ...classified, slug: 'existing-name' }, saved.id);
  expect(explicit.content.slug).toBe('existing-name');
  expect((await (await request(`/api/contents/${saved.id}`)).json() as any).payload).toEqual(payload);
});
