import { createServer } from 'node:http';
import { createHash, timingSafeEqual } from 'node:crypto';
import { execFile } from 'node:child_process';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const root = fileURLToPath(new URL('../../', import.meta.url));
const site = 'https://paf-site-staging.petiteadventurefilms2.workers.dev';
const { STAGING_RUNNER_SECRET, STAGING_SITE_ACCESS_ID, STAGING_SITE_ACCESS_SECRET, STAGING_RUNNER_STATE } = process.env;
const port = Number(process.env.STAGING_RUNNER_PORT ?? 18789);
if (!STAGING_RUNNER_SECRET || STAGING_RUNNER_SECRET.length < 32 ||
    !STAGING_SITE_ACCESS_ID || !STAGING_SITE_ACCESS_SECRET || !STAGING_RUNNER_STATE) {
  throw new Error('Staging runner credentials and a private state directory are required');
}
await mkdir(STAGING_RUNNER_STATE, { recursive: true, mode: 0o700 });
const exec = promisify(execFile);
const buildEnv = { ...process.env };
for (const name of ['CLOUDFLARE_API_TOKEN', 'STAGING_RUNNER_SECRET', 'STAGING_SITE_ACCESS_ID', 'STAGING_SITE_ACCESS_SECRET']) delete buildEnv[name];
const access = { 'CF-Access-Client-Id': STAGING_SITE_ACCESS_ID, 'CF-Access-Client-Secret': STAGING_SITE_ACCESS_SECRET };
const wrangler = (...args) => exec('pnpm', ['--dir', 'cms', 'exec', 'wrangler', ...args, '--config', '../astro/wrangler.staging.jsonc'], {
  cwd: root, timeout: 300_000, maxBuffer: 4 * 1024 * 1024, env: { ...process.env, CI: '1' },
});
const digest = input => createHash('sha256').update(input).digest('hex');
const auth = digest(`Bearer ${STAGING_RUNNER_SECRET}`);
const validId = value => typeof value === 'string' && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(value);
function identity(value) {
  if (!validId(value?.operationId) || !Number.isSafeInteger(value.attempt) || value.attempt < 1 ||
      typeof value.hash !== 'string' || !/^[a-f0-9]{64}$/.test(value.hash)) throw new Error('invalid_attempt');
  return { operationId: value.operationId, attempt: value.attempt, hash: value.hash };
}
async function protectedSite() {
  const options = { redirect: 'manual', cache: 'no-store', signal: AbortSignal.timeout(10_000) };
  const anonymous = await fetch(site, options);
  const location = anonymous.headers.get('location');
  if (anonymous.status !== 302 || !location || !new URL(location).hostname.endsWith('.cloudflareaccess.com')) return false;
  return (await fetch(site, { ...options, headers: access })).ok;
}
async function recordAt(path) {
  try { return JSON.parse(await readFile(path, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
async function record(path, value) {
  await writeFile(path + '.tmp', JSON.stringify(value), { mode: 0o600 });
  await rename(path + '.tmp', path);
}
const gate = join(STAGING_RUNNER_STATE, 'in-flight');
const recordPath = id => join(STAGING_RUNNER_STATE, `${id.operationId}-${id.attempt}.json`);
let working = false;
async function run(id, manifest) {
  const key = `${id.operationId}-${id.attempt}`;
  const path = recordPath(id);
  const input = join(gate, 'manifest.json');
  let activating = false;
  try {
    if (!await protectedSite()) throw new Error('staging_site_access_unverified');
    await writeFile(input, JSON.stringify(manifest), { mode: 0o600 });
    const prepared = await exec(process.execPath, ['cms/scripts/prepare-staging-release.mjs', input], { cwd: root, timeout: 180_000, env: buildEnv });
    const { releaseId, releaseHash } = JSON.parse(prepared.stdout.trim());
    if (releaseId !== key || !/^[a-f0-9]{64}$/.test(releaseHash)) throw new Error('invalid_prepared_release');
    const uploaded = await wrangler('versions', 'upload', '--message', key);
    const versionId = uploaded.stdout.match(/(?:Current )?Version ID:\s+([a-f0-9-]{36})/i)?.[1];
    if (!validId(versionId)) throw new Error('missing_worker_version');
    if (!await protectedSite()) throw new Error('staging_site_access_unverified');
    await record(path, { ...id, status: 'unknown', versionId, releaseHash });
    activating = true;
    await wrangler('versions', 'deploy', `${versionId}@100`, '--yes', '--message', key);
  } catch {
    if (!activating) await record(path, { ...id, status: 'failed' });
  } finally {
    await rm(input, { force: true });
    if (!activating) await rm(gate, { recursive: true, force: true });
    working = false;
  }
}
async function inspect(id, path, prior) {
  if (!prior || prior.hash !== id.hash) return { status: 'unknown' };
  if (prior.status === 'unknown' && prior.versionId && !working) {
    const { stdout } = await wrangler('deployments', 'list', '--json');
    const active = JSON.parse(stdout).sort((a, b) => b.created_on.localeCompare(a.created_on))[0];
    if (!active || active.versions?.length !== 1 || active.versions[0].version_id !== prior.versionId ||
        active.versions[0].percentage !== 100) return { status: 'unknown' };
    const live = await fetch(`${site}/__release.json?attempt=${id.operationId}-${id.attempt}`, {
      headers: access, redirect: 'manual', cache: 'no-store', signal: AbortSignal.timeout(10_000),
    });
    if (!live.ok) return { status: 'unknown' };
    const marker = await live.json();
    if (marker.releaseId !== `${id.operationId}-${id.attempt}` || marker.hash !== prior.releaseHash) return { status: 'unknown' };
    const result = { ...id, status: 'succeeded', deploymentId: active.id, releaseHash: prior.releaseHash };
    await record(path, result);
    await rm(gate, { recursive: true, force: true });
    return result;
  }
  return prior;
}
const server = createServer(async (request, response) => {
  const reply = (code, value) => response.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }).end(JSON.stringify(value));
  if (!timingSafeEqual(Buffer.from(auth), Buffer.from(digest(request.headers.authorization ?? '')))) return reply(401, {});
  if (request.method !== 'POST' || !['/deploy', '/inspect'].includes(request.url)) return reply(404, {});
  try {
    const parts = [];
    let size = 0;
    for await (const chunk of request) {
      size += chunk.length;
      if (size > 64 * 1024 * 1024) return reply(413, {});
      parts.push(chunk);
    }
    const input = JSON.parse(Buffer.concat(parts).toString('utf8'));
    const id = identity(request.url === '/deploy' ? input.delivery : input);
    const path = recordPath(id);
    const prior = await recordAt(path);
    if (prior && prior.hash !== id.hash) return reply(409, {});
    if (request.url === '/inspect') return reply(200, await inspect(id, path, prior));
    if (prior) return reply(202, { status: prior.status });
    if (input.delivery.payload?.type !== 'blog' || digest(JSON.stringify(input.delivery.payload)) !== id.hash) return reply(422, {});
    try { await mkdir(gate, { mode: 0o700 }); }
    catch (error) {
      if (error.code !== 'EEXIST') throw error;
      if (await recordAt(path)) return reply(202, { status: 'unknown' });
      // Busy: no deployment was accepted for this attempt.
      return reply(503, { status: 'busy' });
    }
    await record(path, { ...id, status: 'unknown' });
    working = true;
    void run(id, input).catch(() => console.error('Unable to persist staging deployment status'));
    return reply(202, { status: 'unknown' });
  } catch { return reply(503, { status: 'unknown' }); }
});
server.listen(port, '127.0.0.1', () => console.log(`Staging runner listening on loopback port ${port}`));
