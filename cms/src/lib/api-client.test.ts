import { afterEach, expect, test, vi } from 'vitest';
import { api } from './api-client';
afterEach(() => vi.unstubAllGlobals());
test('a login HTML response is never a successful save', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>login</html>', { headers: { 'Content-Type': 'text/html' } })));
  await expect(api('/api/contents')).rejects.toMatchObject({ status: 401 });
});
test('API failure preserves status and sends same-origin credentials with no redirects', async () => {
  const fetch = vi.fn().mockResolvedValue(Response.json({ error: 'conflict' }, { status: 409 }));
  vi.stubGlobal('fetch', fetch);
  await expect(api('/api/contents')).rejects.toMatchObject({ status: 409 });
  expect(fetch).toHaveBeenCalledWith('/api/contents', expect.objectContaining({ redirect: 'error', credentials: 'same-origin' }));
});
