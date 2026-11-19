import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runHostedStagingJob } from './hosted-staging-job.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const coordinator = 'https://paf-publication-staging.petiteadventurefilms2.workers.dev';
const site = 'https://paf-site-staging.petiteadventurefilms2.workers.dev';
const { STAGING_BUILD_SECRET, STAGING_SITE_ACCESS_ID, STAGING_SITE_ACCESS_SECRET, CLOUDFLARE_API_TOKEN } = process.env;
if (!STAGING_BUILD_SECRET || !STAGING_SITE_ACCESS_ID || !STAGING_SITE_ACCESS_SECRET || !CLOUDFLARE_API_TOKEN) throw new Error('Missing hosted staging credentials');
if (process.env.WRANGLER_CI_OVERRIDE_NAME && process.env.WRANGLER_CI_OVERRIDE_NAME !== 'paf-site-staging') throw new Error('Unexpected build target');
const exec = promisify(execFile);
const access = { 'CF-Access-Client-Id': STAGING_SITE_ACCESS_ID, 'CF-Access-Client-Secret': STAGING_SITE_ACCESS_SECRET };
const buildEnv = { ...process.env };
for (const key of ['STAGING_BUILD_SECRET','STAGING_SITE_ACCESS_ID','STAGING_SITE_ACCESS_SECRET','CLOUDFLARE_API_TOKEN']) delete buildEnv[key];
const wrangler = (...args) => exec('pnpm', ['--dir','cms','exec','wrangler',...args,'--config','../astro/wrangler.staging.jsonc'], {
  cwd: root, env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: '53b7ac20e59cefa91e5b88831768a248', CI: '1' }, timeout: 300_000, maxBuffer: 4 * 1024 * 1024,
});
async function call(action, input = {}) {
  const response = await fetch(`${coordinator}/${action}`, { method: 'POST', redirect: 'manual',
    headers: { Authorization: `Bearer ${STAGING_BUILD_SECRET}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(input), signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error('Coordinator rejected request');
  return response.json();
}
const identity = c => ({ operationId: c.operationId, attempt: c.attempt, hash: c.hash, token: c.token });
const uuid = v => typeof v === 'string' && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(v);
let scratch;
try {
  const result = await runHostedStagingJob({
    claim: () => call('claim'),
    async checkProtection() {
      const options = { redirect: 'manual', cache: 'no-store', signal: AbortSignal.timeout(15_000) };
      const anonymous = await fetch(site, options);
      const location = anonymous.headers.get('location');
      if (anonymous.status !== 302 || !location || !new URL(location).hostname.endsWith('.cloudflareaccess.com')) throw new Error('Access protection missing');
      if (!(await fetch(site, { ...options, headers: access })).ok) throw new Error('Access authentication failed');
    },
    async prepare(c) {
      scratch = await mkdtemp(join(tmpdir(),'paf-hosted-staging-'));
      const input = join(scratch, 'manifest.json');
      await writeFile(input, JSON.stringify(c.manifest), { mode: 0o600 });
      const { stdout } = await exec(process.execPath, ['cms/scripts/prepare-staging-release.mjs',input], {
        cwd: root, env: buildEnv, timeout: 600_000, maxBuffer: 4 * 1024 * 1024,
      });
      const prepared = JSON.parse(stdout.trim());
      if (prepared.releaseId !== `${c.operationId}-${c.attempt}` || !/^[a-f0-9]{64}$/.test(prepared.releaseHash)) throw new Error('Invalid prepared release');
      return prepared;
    },
    async upload(prepared) {
      const { stdout } = await wrangler('versions','upload','--message',prepared.releaseId);
      const versionId = stdout.match(/(?:Current )?Version ID:\s+([a-f0-9-]{36})/i)?.[1];
      if (!uuid(versionId)) throw new Error('Missing uploaded version');
      return { versionId, releaseId: prepared.releaseId };
    },
    authorizeActivation: (c, p) => call('activate', { ...identity(c), versionId: p.versionId, releaseHash: p.releaseHash }),
    activate: p => wrangler('versions','deploy',`${p.versionId}@100`,'--yes','--message',p.releaseId),
    async verify(c,p) {
      const { stdout } = await wrangler('deployments','list','--json');
      const latest = JSON.parse(stdout).sort((a,b) => b.created_on.localeCompare(a.created_on))[0];
      if (!latest || !uuid(latest.id) || latest.versions?.length !== 1 || latest.versions[0].version_id !== p.versionId || latest.versions[0].percentage !== 100) throw new Error('Active version mismatch');
      const response = await fetch(`${site}/__release.json?attempt=${c.operationId}-${c.attempt}`, {
        redirect: 'manual', cache: 'no-store', headers: access, signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) throw new Error('Release marker unavailable');
      const marker = await response.json();
      if (marker.releaseId !== p.releaseId || marker.hash !== p.releaseHash) throw new Error('Release marker mismatch');
      return { versionId:p.versionId, releaseHash:p.releaseHash, deploymentId:latest.id };
    },
    succeed: (c,receipt) => call('succeed', { ...identity(c), ...receipt }),
    fail: c => call('fail', identity(c)),
  });
  // No candidate body, credentials or provider error output enters build logs.
  console.log(`Hosted staging publication: ${result.status}`);
  if (!['succeeded','idle'].includes(result.status)) process.exitCode = 1;
} catch {
  console.error('Hosted staging publication could not acquire work'); process.exitCode = 1;
} finally { if (scratch) await rm(scratch, { recursive:true, force:true }); }
