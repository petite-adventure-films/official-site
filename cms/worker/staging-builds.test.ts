import { expect, test } from 'vitest';
import worker from './staging-builds';
import type { HostedEnvironment } from './services/hosted-staging';
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
