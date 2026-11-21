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
      const payload = { ...(type === 'blog' ? emptyBlogDraft() : emptyArticleDraft(type)), title: `${type} 公開確認`, slug: `release-${type.toLowerCase()}`, body,
        ...(type === 'pressCoverage' ? { sourceName: '掲載元の確認', attachmentAssetIds: [pdf.id], articleBody: { schemaVersion: 2, doc: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '見出しなしの掲載本文' }] }] } } } : {}),
        ...(type === 'video' ? { youtubeId: 'kwHsbFrH2EA', productionYear: '2025', productionCountry: '日本', duration: '62:32' } : {}) };
      const saved = await json('/api/contents', 'POST', { type, operationId: crypto.randomUUID(), payload });
      const state = await publish(saved);
      const html = await (await fetch(state.url)).text();
      expect(html).toContain('公開本文の照合'); expect(html).toContain(`/__cms-media/${image.id}.png`);
      if (type === 'pressCoverage') { expect(html).toContain('掲載元の確認'); expect(html).toContain('見出しなしの掲載本文'); expect(html).toContain(`/__cms-media/${pdf.id}.pdf`); mediaId = saved.id; }
      if (type === 'video') { expect(html).toContain('kwHsbFrH2EA'); expect(html).toContain('62:32'); }
      publicUrls.push(state.url);
      const history = await json(`/api/contents/${saved.id}/history`);
      expect(history.items).toHaveLength(1);
      const edited = await json(`/api/contents/${saved.id}`, 'PUT', { operationId: crypto.randomUUID(), expectedVersion: saved.version, payload: { ...payload, title: '復元前の編集' } });
      const restored = await json(`/api/contents/${saved.id}/restore`, 'POST', { operationId: crypto.randomUUID(), expectedVersion: edited.version, sourceKind: 'publication', sourceId: history.items[0].id });
      expect(restored.payload.title).toBe(payload.title);
      const changed = { ...restored.payload, title: '復元後に保存' };
      await json(`/api/contents/${saved.id}`, 'PUT', { operationId: crypto.randomUUID(), expectedVersion: restored.version, payload: changed });
      expect((await json(`/api/contents/${saved.id}`)).payload).toEqual(changed);
      expect((await json(`/api/contents/${saved.id}/publication`)).version).toBe(1);
    }
    const eventPayload = { ...emptyDraft(), title: '常設イベント公開確認', startDate: '2026-11-22', venue: '公開会場', slug: 'hosted-event-review' };
    const event = await json('/api/contents', 'POST', { type: 'event', operationId: crypto.randomUUID(), payload: eventPayload });
    const eventState = await publish(event);
    expect(await (await fetch(eventState.url)).text()).toContain('公開会場');
    const eventHistory = await json(`/api/contents/${event.id}/history`);
    const eventEdited = await json(`/api/contents/${event.id}`, 'PUT', { operationId: crypto.randomUUID(), expectedVersion: event.version, payload: { ...eventPayload, title: '復元前' } });
    const eventRestored = await json(`/api/contents/${event.id}/restore`, 'POST', { operationId: crypto.randomUUID(), expectedVersion: eventEdited.version, sourceKind: 'publication', sourceId: eventHistory.items[0].id });
    expect(eventRestored.payload.title).toBe(eventPayload.title);
    await json(`/api/contents/${event.id}`, 'PUT', { operationId: crypto.randomUUID(), expectedVersion: eventRestored.version, payload: { ...eventRestored.payload, title: '復元後に保存' } });
    expect((await json(`/api/contents/${event.id}`)).payload.title).toBe('復元後に保存');
    expect((await json(`/api/contents/${event.id}/publication`)).version).toBe(1);
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
