import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { checkBlogPaths, writeBlogAssets } from './publication-runner.mjs';

const astro = fileURLToPath(new URL('../../astro/', import.meta.url));
const output = join(astro, '.wrangler/deploy/staging-site');
const siteOrigin = 'https://paf-site-staging.petiteadventurefilms2.workers.dev';
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const manifestPath = process.argv[2];
if (!manifestPath || process.argv.length !== 3) throw new Error('Usage: node cms/scripts/prepare-staging-release.mjs <manifest.json>');

const { delivery, snapshot, blogs, assets, redirects } = JSON.parse(await readFile(manifestPath, 'utf8'));
if (!/^[a-f0-9-]{36}$/i.test(delivery?.operationId) || !Number.isSafeInteger(delivery.attempt) ||
    delivery.attempt < 1 || hash(delivery.payload) !== delivery.hash || ![blogs, assets, redirects].every(Array.isArray)) {
  throw new Error('Invalid publication manifest');
}
const validPath = value => typeof value === 'string' && /^\/(?!\/)[^\s\\?#*]+\/$/.test(value);
if (!validPath(delivery.routes?.canonicalPath) || !blogs.some(blog => blog.path === delivery.routes.canonicalPath) ||
    redirects.some(({ from, to }) => !validPath(from) || !validPath(to))) throw new Error('Invalid staging site routes');

await mkdir(join(output, '..'), { recursive: true });
const lock = output + '.lock';
await mkdir(lock);
let scratch;
try {
  scratch = await mkdtemp(join(tmpdir(), 'paf-stage-release-'));
  const eventFile = join(scratch, 'events.json');
  const blogFile = join(scratch, 'blogs.json');
  await writeFile(eventFile, JSON.stringify(snapshot), { mode: 0o600 });
  await writeFile(blogFile, JSON.stringify({ blogs, assets: assets.map(({ id, extension }) => ({ id, extension })) }), { mode: 0o600 });
  execFileSync(process.execPath, ['scripts/build-staging.mjs'], {
    cwd: astro, stdio: ['ignore', 'ignore', 'inherit'],
    env: { ...process.env, CMS_EVENT_SNAPSHOT: '', CMS_RELEASE_SNAPSHOT: eventFile,
      CMS_BLOG_RELEASE_SNAPSHOT: blogFile, CMS_SITE_ORIGIN: siteOrigin },
  });
  await checkBlogPaths(output, blogs, redirects);
  await writeBlogAssets(output, assets);
  if (redirects.length) {
    await writeFile(join(output, '_redirects'), redirects.map(({ from, to }) => `${from} ${to} 301\n`).join(''), { flag: 'wx' });
  }
  const releaseId = `${delivery.operationId}-${delivery.attempt}`;
  const releaseHash = hash({ snapshot, blogs, assets, redirects });
  await writeFile(join(output, '__release.json'), JSON.stringify({ releaseId, hash: releaseHash }), { flag: 'wx' });
  console.log(JSON.stringify({ releaseId, releaseHash, output }));
} finally {
  if (scratch) await rm(scratch, { recursive: true, force: true });
  await rm(lock, { recursive: true, force: true });
}
