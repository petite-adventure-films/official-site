import { createHash } from 'node:crypto';
import { linkLegacyBlog } from './services/legacy-blog';
import sources from '../../astro/data/wordpress-export.json';
import copies from './fixtures/legacy-blogs.json';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { unstable_splitSqlQuery } from 'wrangler';
import { createWorkerFixture } from '../src/testing/fixtures';

// Exercises only loopback HTTP and isolated D1/R2. No Cloudflare credentials or browser session.
test('legacy blogs keep old URLs, original dates and attachments through edit, publish, restore and rename', async () => {
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
    const imageBytes = await readFile(new URL('./fixtures/legacy-blog-18043.jpg', import.meta.url));
    const image = await upload(imageBytes, 'image/jpeg', 'legacy-18043.jpg');
    for (const copy of copies) {
      const source = sources.content.blogs.find(item => item.id === copy.oldId)!;
      const payload = JSON.parse(JSON.stringify(copy.payload).replaceAll('asset_48035654fa530a4ce4f5b56e8b4d07c4', image.id));
      const saved = await json('/api/contents', 'POST', { type: 'blog', operationId: crypto.randomUUID(), payload });
      const hash = createHash('sha256').update(JSON.stringify(source)).digest('hex');
      await expect(linkLegacyBlog(fixture.db, saved.id, source.id, '0'.repeat(64))).rejects.toThrow('legacy_source_mismatch');
      const blocked = await req(`/api/contents/${saved.id}/publication`, 'POST', { operationId: crypto.randomUUID(), expectedVersion: saved.version, expectedPublicationVersion: 0 });
      expect(blocked.status).toBe(422);
      expect(await blocked.json()).toMatchObject({ error: 'invalid_publication', issues: [{ field: 'slug' }] });
      await linkLegacyBlog(fixture.db, saved.id, source.id, hash);
      await expect(fixture.db.prepare('UPDATE legacy_blog_links SET source_id = ? WHERE content_id = ?').bind(source.id, saved.id).run()).rejects.toThrow();
      await expect(fixture.db.prepare('DELETE FROM legacy_blog_links WHERE content_id = ?').bind(saved.id).run()).rejects.toThrow();
      const duplicate = await json('/api/contents', 'POST', { type: 'blog', operationId: crypto.randomUUID(), payload });
      await expect(linkLegacyBlog(fixture.db, duplicate.id, source.id, hash)).rejects.toThrow();
      const state = await publish(saved);
      expect(new URL(state.url).pathname).toBe(`/${source.name}/`);
      const original = await (await fetch(state.url)).text();
      expect(original).toContain(source.title);
      expect(original).toContain(source.published);
      const history = await json(`/api/contents/${saved.id}/history`);
      const edited = await json(`/api/contents/${saved.id}`, 'PUT', { operationId: crypto.randomUUID(), expectedVersion: saved.version, payload: { ...payload, title: source.title + ' 再編集' } });
      expect(await (await fetch(state.url)).text()).toBe(original);
      const second = await publish(edited);
      const revised = await (await fetch(second.url)).text();
      expect(revised).toContain(source.title + ' 再編集');
      expect(revised).toContain(source.published);
      const restored = await json(`/api/contents/${saved.id}/restore`, 'POST', { operationId: crypto.randomUUID(), expectedVersion: edited.version, sourceKind: 'publication', sourceId: history.items[0].id });
      expect(restored.payload).toEqual(payload);
      const renamed = await json(`/api/contents/${saved.id}`, 'PUT', { operationId: crypto.randomUUID(), expectedVersion: restored.version, payload: { ...restored.payload, slug: 'legacy-moved-' + source.id } });
      const moved = await publish(renamed);
      expect(await (await fetch(moved.url)).text()).toContain(source.published);
      const redirect = await fetch(state.url, { redirect: 'manual' });
      expect(redirect.status).toBe(301);
      expect(redirect.headers.get('Location')).toBe('/legacy-moved-' + source.id + '/');
      if (source.id === 18043) {
        const served = await fetch(runner.siteOrigin + '/__cms-media/' + image.id + '.jpg');
        expect(Buffer.from(await served.arrayBuffer())).toEqual(imageBytes);
      }
    }
  } finally { await fixture.dispose(); await runner.close(); await rm(root, { recursive: true, force: true }); }
}, 120_000);
