import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const snapshot = JSON.parse(readFileSync(path.join(root, 'data/wordpress-export.json'), 'utf8'));
const inventory = readFileSync(path.join(root, '../docs/url-inventory.md'), 'utf8');

function outputFile(urlPath) {
  let decodedPath = urlPath.replace(/\?.*$/, '');
  try {
    decodedPath = decodeURIComponent(decodedPath);
  } catch {
    // WordPress由来の不正なエンコードは、元のパスのまま検証する。
  }
  if (decodedPath === '/404') return path.join(root, 'dist/404.html');
  if (decodedPath.endsWith('.html')) return path.join(root, 'dist', decodedPath);
  return path.join(root, 'dist', decodedPath, 'index.html');
}

function verify(label, paths) {
  const missing = paths.filter((urlPath) => !existsSync(outputFile(urlPath)));
  console.log(`${label}: ${String(paths.length - missing.length)}/${String(paths.length)}`);
  if (missing.length > 0) {
    throw new Error(`${label} missing:\n${missing.join('\n')}`);
  }
}

const inventoryPaths = inventory
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => /^\/\S+$/.test(line) && !line.includes('〜'));

verify('URL inventory', inventoryPaths);
verify(
  'Blog details',
  snapshot.content.blogs.map((post) => `/${post.name}/`),
);
verify(
  'Event details',
  snapshot.content.events.map((event) => `/events/${String(event.id)}/`),
);
verify(
  'Media details',
  snapshot.content.media.map((media) => `/media/${String(media.id)}/`),
);
verify(
  'Channel details',
  snapshot.content.channels.map((channel) => `/channel/${String(channel.id)}/`),
);

const workshopReports = snapshot.content.blogs.filter((post) => post.tag_ids?.includes(5026));
const workshopArchivePaths = [
  '/blog/tag/映像ワークショップレポート/',
  '/blog/tag/映像ワークショップレポート/page/2/',
];
verify('Workshop report archives', workshopArchivePaths);

const archiveHtml = workshopArchivePaths
  .map((urlPath) => readFileSync(outputFile(urlPath), 'utf8'))
  .join('\n');
const missingWorkshopReports = workshopReports.filter(
  (post) => !archiveHtml.includes(`/${decodeURIComponent(post.name)}/`),
);
if (missingWorkshopReports.length > 0) {
  throw new Error(
    `Workshop reports missing from archives:\n${missingWorkshopReports
      .map((post) => post.name)
      .join('\n')}`,
  );
}
console.log(
  `Workshop report entries: ${String(workshopReports.length)}/${String(workshopReports.length)}`,
);
