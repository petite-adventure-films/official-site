import { emptyDraft } from '../src/features/events/draft';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { unstable_splitSqlQuery } from 'wrangler';
import { createWorkerFixture } from '../src/testing/fixtures';
import { emptyArticleDraft, type ArticleDraft } from '../src/features/articles/draft';
import { emptyBlogDraft } from '../src/features/blog/draft';

// Exercises only loopback HTTP and isolated D1/R2. No Cloudflare credentials or browser session.
test('real local release: blog and all article types, assets, history, restore, re-edit and redirect', async () => {
  const runnerPath = '../scripts/publication-runner.mjs';
  const { startPublicationRunner } = await import(runnerPath);
  const root = await mkdtemp(join(tmpdir(), 'paf-article-release-'));
  const runner = await startPublicationRunner(root, { controlPort: 0, sitePort: 0 });
  const fixture = await createWorkerFixture('local', { LOCAL_PUBLICATION: '1', LOCAL_PUBLICATION_PORT: new URL(runner.controlOrigin).port, LOCAL_SITE_PORT: new URL(runner.siteOrigin).port });
  const req = (path: string, method = 'GET', body?: unknown) => fixture.runtime.dispatchFetch('http://localhost' + path, { method, headers: { Origin: 'http://127.0.0.1:5174', 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
  async function json(path: string, method = 'GET', body?: unknown) {
    const r = await req(path, method, body); const result = await r.json() as any;
    expect(r.ok, JSON.stringify(result)).toBe(true); return result;
  }
  async function upload(bytes: Buffer, mimeType: string, filename: string) {
    const sha256 = Buffer.from(await crypto.subtle.digest('SHA-256', new Uint8Array(bytes))).toString('hex');
    const registered = await json('/api/media/uploads', 'POST', { operationId: crypto.randomUUID(), filename, mimeType, sizeBytes: bytes.length, sha256 });
    expect((await fixture.runtime.dispatchFetch(`http://localhost/api/local/media/${registered.id}`, { method: 'PUT', headers: { Origin: 'http://127.0.0.1:5174', 'Content-Type': mimeType }, body: bytes })).status).toBe(204);
    return json(`/api/media/${registered.id}/complete`, 'POST', {});
  }
  async function publish(saved: any) {
    const base = await json(`/api/contents/${saved.id}/publication`);
    await json(`/api/contents/${saved.id}/publication`, 'POST', { operationId: crypto.randomUUID(), expectedVersion: saved.version, expectedPublicationVersion: base.version });
    for (let n = 0; n < 160; n++) {
      const state = await json(`/api/contents/${saved.id}/publication`);
      if (state.operation?.state === 'succeeded') return state;
      expect(state.operation?.state).not.toBe('failed');
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    throw new Error('local_publication_timeout');
  }
  let previousRevision = '';
  async function checkRestore(saved: any, state: any) {
    const path = `/api/contents/${saved.id}`;
    const history = await json(path + '/history');
    expect(history.items).toHaveLength(1);
    const published = await fixture.db.prepare('SELECT * FROM publication_state WHERE content_id = ?').bind(saved.id).first();
    const revisions = await fixture.db.prepare('SELECT * FROM publication_revisions WHERE content_id = ?').bind(saved.id).all();
    const publicHtml = await (await fetch(state.url)).text();
    const editedPayload = { ...saved.payload, title: '復元前の編集', filmTagIds: ['164'] };
    const edited = await json(path, 'PUT', { operationId: crypto.randomUUID(), expectedVersion: saved.version, payload: editedPayload });
    const input = { operationId: crypto.randomUUID(), expectedVersion: edited.version, sourceKind: 'publication', sourceId: history.items[0].id };
    if (previousRevision) expect((await req(path + '/restore', 'POST', { ...input, sourceId: previousRevision })).status).toBe(404);
    previousRevision = history.items[0].id;
    const [restored, replay] = await Promise.all([json(path + '/restore', 'POST', input), json(path + '/restore', 'POST', input)]);
    expect(replay).toEqual(restored);
    expect(restored.payload).toEqual(history.items[0].payload);
    expect(restored.payload.title).toBe(saved.payload.title);
    expect(restored.payload.filmTagIds).toEqual(saved.payload.filmTagIds);
    if (saved.type !== 'event') expect(restored.payload).toEqual(saved.payload);
    else expect(restored.payload.eventTagIds).toEqual(saved.payload.eventTagIds);
    if (saved.type === 'blog') {
      expect(restored.payload.categoryId).toBe(saved.payload.categoryId);
      expect(restored.payload.isRecommended).toBe(true);
      expect(restored.payload.isWorkshopReport).toBe(true);
    }
    if (saved.type === 'pressCoverage') {
      expect(restored.payload.attachmentAssetIds).toEqual(saved.payload.attachmentAssetIds);
      expect(restored.payload.articleBody).toEqual(saved.payload.articleBody);
    }
    expect((await req(path + '/restore', 'POST', { ...input, operationId: crypto.randomUUID() })).status).toBe(409);
    expect((await req(path, 'PUT', { operationId: crypto.randomUUID(), expectedVersion: edited.version, payload: editedPayload })).status).toBe(409);
    const protection = (await json(path + '/history')).items[0];
    expect(protection).toMatchObject({ kind: 'protectedDraft', payload: editedPayload });
    const recovered = await json(path + '/restore', 'POST', { operationId: crypto.randomUUID(), expectedVersion: restored.version, sourceKind: 'protectedDraft', sourceId: protection.id });
    expect(recovered.payload).toEqual(editedPayload);
    expect((await json(path + '/history')).items[0].payload).toEqual(restored.payload);
    expect(await json(path + '/restore', 'POST', input)).toEqual(restored);
    expect((await json(path)).payload).toEqual(editedPayload);
    const changed = { ...recovered.payload, title: '復元後に保存' };
    await json(path, 'PUT', { operationId: crypto.randomUUID(), expectedVersion: recovered.version, payload: changed });
    expect((await json(path)).payload).toEqual(changed);
    expect(await fixture.db.prepare('SELECT * FROM publication_state WHERE content_id = ?').bind(saved.id).first()).toEqual(published);
    expect((await fixture.db.prepare('SELECT * FROM publication_revisions WHERE content_id = ?').bind(saved.id).all()).results).toEqual(revisions.results);
    expect(await (await fetch(state.url)).text()).toBe(publicHtml);
  }
  try {
    for (const name of (await readdir(new URL('../migrations/', import.meta.url))).filter(n => n.endsWith('.sql')).sort()) {
      await fixture.db.batch(unstable_splitSqlQuery(await readFile(new URL(`../migrations/${name}`, import.meta.url), 'utf8')).map(sql => fixture.db.prepare(sql)));
    }
    const imageBytes = await readFile(new URL('../e2e/fixtures/media/sample.png', import.meta.url));
    const pdfBytes = Buffer.from('%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\n%%EOF\n');
    const image = await upload(imageBytes, 'image/png', '確認.png');
    const pdf = await upload(pdfBytes, 'application/pdf', '確認.pdf');
    const body: ArticleDraft['body'] = { schemaVersion: 2, doc: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '公開本文の照合' }] }, { type: 'assetImage', attrs: { assetId: image.id, alt: '確認画像' } }] } };
    let mediaId = '';
    const publicUrls: string[] = [];
    for (const type of ['blog', 'news', 'pressCoverage', 'video'] as const) {
      const payload = { ...(type === 'blog' ? { ...emptyBlogDraft(), categoryId: '2879', isRecommended: true, isWorkshopReport: true, eventTagIds: ['177'] } : emptyArticleDraft(type)), title: `${type} 公開確認`, slug: `release-${type.toLowerCase()}`, body, filmTagIds: ['153'],
        ...(type === 'pressCoverage' ? { sourceName: '掲載元の確認', attachmentAssetIds: [pdf.id], articleBody: { schemaVersion: 2, doc: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '見出しなしの掲載本文' }] }] } } } : {}),
        ...(type === 'video' ? { youtubeId: 'kwHsbFrH2EA', productionYear: '2025', productionCountry: '日本', duration: '62:32' } : {}) };
      const saved = await json('/api/contents', 'POST', { type, operationId: crypto.randomUUID(), payload });
      const state = await publish(saved);
      const html = await (await fetch(state.url)).text();
      expect(html).toContain('公開本文の照合'); expect(html).toContain(`/__cms-media/${image.id}.png`);
      if (type === 'pressCoverage') { expect(html).toContain('掲載元の確認'); expect(html).toContain('見出しなしの掲載本文'); expect(html).toContain(`/__cms-media/${pdf.id}.pdf`); mediaId = saved.id; }
      if (type === 'video') { expect(html).toContain('kwHsbFrH2EA'); expect(html).toContain('62:32'); }
      publicUrls.push(state.url);
      await checkRestore(saved, state);
    }
    const eventPayload = { ...emptyDraft(), title: '常設イベント公開確認', startDate: '2026-11-22', venue: '公開会場', slug: 'hosted-event-review', filmTagIds: ['153'], eventTagIds: ['181'] };
    const event = await json('/api/contents', 'POST', { type: 'event', operationId: crypto.randomUUID(), payload: eventPayload });
    const eventState = await publish(event);
    expect(await (await fetch(eventState.url)).text()).toContain('公開会場');
    await checkRestore(event, eventState);
    publicUrls.push(eventState.url);
    for (const url of publicUrls) expect((await fetch(url)).status).toBe(200);
    expect(Buffer.from(await (await fetch(`${runner.siteOrigin}/__cms-media/${image.id}.png`)).arrayBuffer())).toEqual(imageBytes);
    expect(Buffer.from(await (await fetch(`${runner.siteOrigin}/__cms-media/${pdf.id}.pdf`)).arrayBuffer())).toEqual(pdfBytes);
    const before = await json(`/api/contents/${mediaId}`);
    const moved = await json(`/api/contents/${mediaId}`, 'PUT', { operationId: crypto.randomUUID(), expectedVersion: before.version, payload: { ...before.payload, slug: 'release-media-moved' } });
    const state = await publish(moved);
    const redirect = await fetch(`${runner.siteOrigin}/media/release-presscoverage/`, { redirect: 'manual' });
    expect(redirect.status).toBe(301); expect(redirect.headers.get('Location')).toBe('/media/release-media-moved/');
    expect((await fetch(state.url)).status).toBe(200);
  } finally { await fixture.dispose(); await runner.close(); await rm(root, { recursive: true, force: true }); }
}, 90_000);
