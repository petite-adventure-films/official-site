import { expect, test, vi } from 'vitest';
import worker from './staging-builds';
import type { HostedEnvironment } from './services/hosted-staging';
import { HostedStaging } from './services/hosted-staging';
const env = { STAGING_BUILD_SECRET:'x'.repeat(64) } as HostedEnvironment;
test('build endpoints reject anonymous and incorrect credentials before touching storage', async () => {
  for (const authorization of ['', 'Bearer incorrect']) {
    const result = await worker.fetch(new Request('https://builds/claim',{method:'POST',headers:{Authorization:authorization}}), env);
    expect(result.status).toBe(401);
  }
});
test('build credential grants no public enqueue or CMS editing endpoint', async () => {
  for (const path of ['/deploy','/api/contents','/inspect']) {
    const result = await worker.fetch(new Request(`https://builds${path}`,{method:'POST',headers:{Authorization:`Bearer ${env.STAGING_BUILD_SECRET}`}}), env);
    expect(result.status).toBe(404);
  }
});
test('missing credentials fails closed', async () => {
  const result = await worker.fetch(new Request('https://builds/claim',{method:'POST'}), {} as HostedEnvironment);
  expect(result.status).toBe(503);
});
test('a granted activation permit is not hidden by an unrelated reconciliation failure', async () => {
  const report = vi.spyOn(HostedStaging.prototype, 'report').mockResolvedValue(true);
  const reconcile = vi.spyOn(HostedStaging.prototype, 'reconcile').mockRejectedValue(new Error('unrelated'));
  try {
    const response = await worker.fetch(new Request('https://builds/activate', {
      method: 'POST', headers: { Authorization: `Bearer ${env.STAGING_BUILD_SECRET}` }, body: '{}',
    }), env);
    expect(response.status).toBe(200);
    expect(report).toHaveBeenCalledWith('activate', {});
    expect(reconcile).not.toHaveBeenCalled();
  } finally { vi.restoreAllMocks(); }
});
