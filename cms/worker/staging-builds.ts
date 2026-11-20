import { HostedStaging, type HostedEnvironment } from './services/hosted-staging';

export default {
  async fetch(request: Request, env: HostedEnvironment): Promise<Response> {
    const reply = (status: number, value: unknown = {}) => Response.json(value, { status, headers: { 'Cache-Control': 'no-store' } });
    if (!env.STAGING_BUILD_SECRET || env.STAGING_BUILD_SECRET.length < 32) return reply(503);
    const expected = new TextEncoder().encode(`Bearer ${env.STAGING_BUILD_SECRET}`);
    const received = new TextEncoder().encode(request.headers.get('Authorization') ?? '');
    const [a, b] = await Promise.all([expected, received].map(value => crypto.subtle.digest('SHA-256', value)));
    const left = new Uint8Array(a), right = new Uint8Array(b);
    let difference = 0;
    for (let i = 0; i < left.length; i++) difference |= left[i] ^ right[i];
    if (difference !== 0) return reply(401);
    const action = new URL(request.url).pathname.slice(1);
    if (request.method !== 'POST' || !['claim','activate','succeed','fail'].includes(action)) return reply(404);
    try {
      const coordinator = new HostedStaging(env);
      if (action === 'claim') return reply(200, await coordinator.claim());
      const reader = request.body?.getReader();
      if (!reader) return reply(400);
      const chunks: Uint8Array[] = []; let size = 0;
      for (;;) { const { done, value } = await reader.read(); if (done) break; size += value.length;
        if (size > 8192) { await reader.cancel(); return reply(413); } chunks.push(value); }
      const input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      if (!input || typeof input !== 'object' || Array.isArray(input)) return reply(400);
      const accepted = await coordinator.report(action, input);
      // Activation has no terminal result to reconcile. A later unrelated
      // reconciliation error must not hide an already-issued single-use permit.
      if (accepted && action !== 'activate') await coordinator.reconcile();
      return reply(accepted ? 200 : 409);
    } catch { return reply(503); }
  },
  async scheduled(_event: unknown, env: HostedEnvironment) {
    if (env.STAGING_SITE_ACCESS_ID && env.STAGING_SITE_ACCESS_SECRET) await new HostedStaging(env).reconcile();
  },
};
