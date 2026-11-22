import { validateStagingManifest } from './staging-manifest.mjs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { checkBlogPaths, checkArticlePaths, writeBlogAssets } from './publication-runner.mjs';

const astro = fileURLToPath(new URL('../../astro/', import.meta.url));
const output = join(astro, '.wrangler/deploy/staging-site');
const siteOrigin = 'https://paf-site-staging.petiteadventurefilms2.workers.dev';
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const manifestPath = process.argv[2];
if (!manifestPath || process.argv.length !== 3) throw new Error('Usage: node cms/scripts/prepare-staging-release.mjs <manifest.json>');

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
validateStagingManifest(manifest);
const { delivery, snapshot, blogs, articles = [], assets, redirects } = manifest;

await mkdir(join(output, '..'), { recursive: true });
const lock = output + '.lock';
await mkdir(lock);
let scratch;
try {
  scratch = await mkdtemp(join(tmpdir(), 'paf-stage-release-'));
  const eventFile = join(scratch, 'events.json');
  const blogFile = join(scratch, 'blogs.json');
  await writeFile(eventFile, JSON.stringify(snapshot), { mode: 0o600 });
  await writeFile(blogFile, JSON.stringify({ blogs, articles, assets: assets.map(({ id, extension }) => ({ id, extension })) }), { mode: 0o600 });
  execFileSync(process.execPath, ['scripts/build-staging.mjs'], {
    cwd: astro, stdio: ['ignore', 'ignore', 'inherit'],
    env: { ...process.env, CMS_EVENT_SNAPSHOT: '', CMS_RELEASE_SNAPSHOT: eventFile,
      CMS_BLOG_RELEASE_SNAPSHOT: blogFile, CMS_SITE_ORIGIN: siteOrigin },
  });
  await checkBlogPaths(output, blogs, redirects);
  await checkArticlePaths(output, articles);
  await writeBlogAssets(output, assets);
  if (redirects.length) {
    await writeFile(join(output, '_redirects'), redirects.map(({ from, to }) => `${from} ${to} 301\n`).join(''), { flag: 'wx' });
  }
  const releaseId = `${delivery.operationId}-${delivery.attempt}`;
  const releaseHash = hash({ snapshot, blogs, articles, assets, redirects });
  await writeFile(join(output, '__release.json'), JSON.stringify({ releaseId, hash: releaseHash }), { flag: 'wx' });
  console.log(JSON.stringify({ releaseId, releaseHash, output }));
} finally {
  if (scratch) await rm(scratch, { recursive: true, force: true });
  await rm(lock, { recursive: true, force: true });
}
