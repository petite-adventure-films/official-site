import { startPublicationRunner } from './publication-runner.mjs';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const testStorage = process.env.CMS_E2E === '1' ? mkdtempSync(join(tmpdir(), 'paf-cms-e2e-')) : null;
const storageArgs = testStorage ? ['--persist-to', testStorage] : [];
const migration = spawnSync('pnpm', ['exec', 'wrangler', 'd1', 'migrations', 'apply', 'DB', '--local', '--config', 'wrangler.local.jsonc', ...storageArgs], { stdio: 'inherit' });
if (migration.status !== 0) process.exit(migration.status ?? 1);

if (testStorage) {
  for (const file of ['e2e/history-fixtures.sql', 'e2e/history-url-fixtures.sql']) {
    const seed = spawnSync('pnpm', ['exec', 'wrangler', 'd1', 'execute', 'DB', '--local', '--config', 'wrangler.local.jsonc', ...storageArgs, '--file', file], { stdio: 'inherit' });
    if (seed.status !== 0) { rmSync(testStorage, { recursive: true, force: true }); process.exit(seed.status ?? 1); }
  }
}

const runner = await startPublicationRunner(testStorage ? join(testStorage, 'publications') : fileURLToPath(new URL('../../.local/cms-publications/', import.meta.url)));
const children = ['dev:api', 'dev:ui'].map((script) =>
  spawn('pnpm', ['run', script, ...(script === 'dev:api' ? [...storageArgs, '--var', 'LOCAL_PUBLICATION:1'] : [])], { stdio: 'inherit' }),
);
let stopping = false;
function stop(code) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  runner.close();
  for (const child of children) child.kill('SIGTERM');
}
for (const child of children) {
  child.on('error', () => stop(1));
  child.on('exit', (code) => stop(code ?? 1));
}
process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
process.on('exit', () => { if (testStorage) rmSync(testStorage, { recursive: true, force: true }); });
