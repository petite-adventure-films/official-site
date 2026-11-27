import { expect, test } from 'vitest';
import worker from './migration-media';
const bytes = new TextEncoder().encode('synthetic asset');
const digest = async (value: Uint8Array) =>
  Array.from(
    new Uint8Array(
      await crypto.subtle.digest('SHA-256', Uint8Array.from(value).buffer),
    ),
    (b) => b.toString(16).padStart(2, '0'),
  ).join('');
async function fixture(mime = 'image/png', extension = 'png') {
  const sha = await digest(bytes),
    id = 'asset_' + 'a'.repeat(32);
  const asset = {
    id,
    original: {
      mimeType: mime,
      sha256: sha,
      sizeBytes: bytes.length,
      storageKey: `originals/${sha.slice(0, 2)}/${sha}.${extension}`,
    },
  };
  const env = {
    DB: {
      prepare(sql: string) {
        expect(sql).toContain("m.state='confirmed'");
        return {
          bind(key: string) {
            return {
              async first() {
                return key === id
                  ? { asset_json: JSON.stringify(asset) }
                  : null;
              },
            };
          },
        };
      },
    },
    MEDIA: {
      async get(key: string) {
        expect(key).toBe(asset.original.storageKey);
        return {
          size: bytes.length,
          async arrayBuffer() {
            return bytes.slice().buffer;
          },
        };
      },
    },
  };
  return {
    env: env as any,
    asset,
    url: `https://example.test/media/${id}.${extension}`,
  };
}
test('serves only confirmed immutable attachment bytes; no article, list or write routes', async () => {
  const f = await fixture();
  const response = await worker.fetch(new Request(f.url), f.env);
  expect(response.status).toBe(200);
  expect(response.headers.get('Content-Type')).toBe('image/png');
  expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
  expect(new Uint8Array(await response.arrayBuffer())).toEqual(bytes);
  expect(
    await (
      await worker.fetch(new Request(f.url, { method: 'HEAD' }), f.env)
    ).text(),
  ).toBe('');
  for (const path of ['/', '/api/contents', '/api/media', '/originals/a.png'])
    expect(
      (await worker.fetch(new Request('https://example.test' + path), f.env))
        .status,
    ).toBe(404);
  expect(
    (await worker.fetch(new Request(f.url, { method: 'POST' }), f.env)).status,
  ).toBe(405);
  expect(
    (await worker.fetch(new Request(f.url.replace('.png', '.pdf')), f.env))
      .status,
  ).toBe(503);
});
test('PDF downloads and storage/hash mismatches fail closed', async () => {
  const f = await fixture('application/pdf', 'pdf');
  expect(
    (await worker.fetch(new Request(f.url), f.env)).headers.get(
      'Content-Disposition',
    ),
  ).toMatch(/^attachment;/);
  f.env.MEDIA.get = async () => ({
    size: bytes.length,
    arrayBuffer: async () => new Uint8Array(bytes.length).buffer,
  });
  expect((await worker.fetch(new Request(f.url), f.env)).status).toBe(503);
  f.env.MEDIA.get = async () => null;
  expect((await worker.fetch(new Request(f.url), f.env)).status).toBe(503);
});
