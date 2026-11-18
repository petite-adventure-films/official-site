import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { startPublicationRunner } from './publication-runner.mjs';

test('a real failed build preserves the last release, rejects browser control, and survives restart', { timeout: 30_000 }, async () => {
  const root = await mkdtemp(join(tmpdir(), 'paf-publication-runner-'));
  let runner;
  try {
    await mkdir(join(root, 'previous/site'), { recursive: true });
    await writeFile(join(root, 'previous/site/index.html'), '<h1>previous publication</h1>');
    await writeFile(join(root, 'active.json'), JSON.stringify({ key: 'previous', redirects: [] }));
    runner = await startPublicationRunner(root, { controlPort: 0, sitePort: 0 });
    const payload = { title: 'invalid snapshot' };
    const delivery = { operationId: randomUUID(), attempt: 1, hash: createHash('sha256').update(JSON.stringify(payload)).digest('hex'), payload, routes: { canonicalPath: '/events/test/' } };
    const send = (path, extra = {}) => fetch(`${runner.controlOrigin}/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CMS-Runner': 'local-publication', ...extra }, body: JSON.stringify({ delivery, snapshot: {}, redirects: [] }) });
    assert.equal((await send('deploy', { Origin: 'http://malicious.example' })).status, 403);
    assert.equal((await send('deploy')).status, 200);
    let status = 'unknown';
    for (let count = 0; count < 100 && status === 'unknown'; count++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      status = (await (await send('inspect')).json()).status;
    }
    assert.equal(status, 'failed');
    assert.equal(await (await fetch(runner.siteOrigin)).text(), '<h1>previous publication</h1>');
    await runner.close(); runner = await startPublicationRunner(root, { controlPort: 0, sitePort: 0 });
    assert.equal((await (await send('inspect')).json()).status, 'failed');
    assert.equal(await (await fetch(runner.siteOrigin)).text(), '<h1>previous publication</h1>');
  } finally { await runner?.close(); await rm(root, { recursive: true, force: true }); }
});
