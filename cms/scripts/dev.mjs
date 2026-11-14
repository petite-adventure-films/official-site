import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const testStorage = process.env.CMS_E2E === '1' ? mkdtempSync(join(tmpdir(), 'paf-cms-e2e-')) : null;
const storageArgs = testStorage ? ['--persist-to', testStorage] : [];
const migration = spawnSync('pnpm', ['exec', 'wrangler', 'd1', 'migrations', 'apply', 'DB', '--local', '--config', 'wrangler.local.jsonc', ...storageArgs], { stdio: 'inherit' });
if (migration.status !== 0) process.exit(migration.status ?? 1);

const children = ['dev:api', 'dev:ui'].map((script) =>
  spawn('pnpm', ['run', script, ...(script === 'dev:api' ? storageArgs : [])], { stdio: 'inherit' }),
);
let stopping = false;
function stop(code) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  for (const child of children) child.kill('SIGTERM');
}
for (const child of children) {
  child.on('error', () => stop(1));
  child.on('exit', (code) => stop(code ?? 1));
}
process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
process.on('exit', () => { if (testStorage) rmSync(testStorage, { recursive: true, force: true }); });
