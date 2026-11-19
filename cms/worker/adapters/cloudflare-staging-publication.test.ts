import { expect, test, vi } from 'vitest';
import type { Database } from '../repositories/content-drafts';
import type { MediaBucket } from '../routes/media';
import type { Delivery } from '../services/publication';
import { CloudflareStagingPublication, stagingRunner } from './cloudflare-staging-publication';

test('temporary runner sends only its own credential and does not follow redirects', async () => {
  const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 302 }));
  vi.stubGlobal('fetch', fetcher);
  try {
    expect(stagingRunner('invalid-url', 'x'.repeat(64))).toBeNull();
    expect(stagingRunner('http://runner.example', 'x'.repeat(64))).toBeNull();
    const runner = stagingRunner('https://runner.example', 'x'.repeat(64))!;
    await runner.fetch(new Request('https://publication-runner/inspect', { method: 'POST', body: '{}' }));
    const headers = new Headers(fetcher.mock.calls[0][1]?.headers);
    expect(headers.get('Authorization')).toBe(`Bearer ${'x'.repeat(64)}`);
    expect(headers.has('CF-Access-Client-Secret')).toBe(false);
    expect(fetcher.mock.calls[0][1]?.redirect).toBe('manual');
  } finally { vi.unstubAllGlobals(); }
});

const delivery = {
  operationId: 'ef0d327a-7818-4e32-ad70-fce52094aa37', attempt: 2, hash: '1'.repeat(64),
} as Delivery;
const releaseHash = '2'.repeat(64);
const report = { status: 'succeeded', operationId: delivery.operationId, attempt: 2, hash: delivery.hash,
  deploymentId: 'deployment', releaseHash };
const marker = { releaseId: `${delivery.operationId}-2`, hash: releaseHash };

test('calls the runtime global fetch without binding it to the adapter instance', async () => {
  vi.stubGlobal('fetch', function (this: unknown) {
    if (this instanceof CloudflareStagingPublication) throw new TypeError('Illegal invocation');
    return Promise.resolve(Response.json(marker));
  });
  try {
    const adapter = new CloudflareStagingPublication({} as Database, {} as MediaBucket,
      { fetch: async () => Response.json(report) }, { id: 'id', secret: 'secret' });
    await expect(adapter.inspect(delivery)).resolves.toMatchObject({ status: 'succeeded' });
  } finally { vi.unstubAllGlobals(); }
});

test('only confirms the exact active staging release even when the runner reports success', async () => {
  const runner = { fetch: vi.fn(async () => Response.json(report)) };
  const fetchSite = vi.fn<typeof fetch>()
    .mockResolvedValueOnce(new Response(null, { status: 302 }))
    .mockResolvedValueOnce(Response.json({ ...marker, hash: '3'.repeat(64) }))
    .mockResolvedValueOnce(Response.json(marker));
  const adapter = new CloudflareStagingPublication({} as Database, {} as MediaBucket, runner, { id: 'id', secret: 'secret' }, fetchSite);
  await expect(adapter.inspect(delivery)).resolves.toEqual({ status: 'unknown' });
  await expect(adapter.inspect(delivery)).resolves.toEqual({ status: 'unknown' });
  await expect(adapter.inspect(delivery)).resolves.toEqual({
    status: 'succeeded', operationId: delivery.operationId, attempt: 2, hash: delivery.hash, receipt: `deployment:${releaseHash}`,
  });
  expect(String(fetchSite.mock.calls[0][0])).toContain('https://paf-site-staging.petiteadventurefilms2.workers.dev/__release.json');
  expect(fetchSite.mock.calls[0][1]).toMatchObject({ redirect: 'manual', headers: { 'CF-Access-Client-Id': 'id', 'CF-Access-Client-Secret': 'secret' } });
});

test('ignores a report from another attempt without requesting the live site', async () => {
  const runner = { fetch: vi.fn(async () => Response.json({ ...report, attempt: 1 })) };
  const fetchSite = vi.fn<typeof fetch>();
  const adapter = new CloudflareStagingPublication({} as Database, {} as MediaBucket, runner, { id: 'id', secret: 'secret' }, fetchSite);
  await expect(adapter.inspect(delivery)).resolves.toEqual({ status: 'unknown' });
  expect(fetchSite).not.toHaveBeenCalled();
});
