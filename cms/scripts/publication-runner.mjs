import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, rename, stat } from 'node:fs/promises';
import { resolve, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
const astro = fileURLToPath(new URL('../../astro/', import.meta.url));
const digest = value => createHash('sha256').update(value).digest('hex');
const readJson = async path => JSON.parse(await readFile(path, 'utf8'));
async function atomic(path, value) { await writeFile(`${path}.tmp`, JSON.stringify(value), { mode: 0o600 }); await rename(`${path}.tmp`, path); }
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.xml': 'application/xml', '.pdf': 'application/pdf', '.gif': 'image/gif' };
async function writeBlogAssets(out, assets) {
  if (!assets.length) return;
  const dir = join(out, '__cms-media');
  await mkdir(dir);
  for (const { id, extension, bytes } of assets) {
    if (!/^asset_[a-f0-9]{32}$/.test(id) || !['png', 'jpg', 'gif', 'webp', 'pdf'].includes(extension)) throw new Error('invalid_blog_asset');
    await writeFile(join(dir, `${id}.${extension}`), Buffer.from(bytes, 'base64'), { flag: 'wx' });
  }
}
async function checkBlogPaths(out, blogs, redirects) {
  for (const { path } of blogs) {
    const slug = path.slice(1, -1);
    const html = await readFile(join(out, decodeURIComponent(slug), 'index.html'), 'utf8');
    const marker = Buffer.from(decodeURIComponent(slug)).toString('hex');
    if (!html.includes(`data-cms-blog="${marker}"`)) throw new Error('blog_url_reserved');
  }
  for (const { from } of redirects) {
    if (from.startsWith('/events/')) continue;
    const path = resolve(out, `.${decodeURIComponent(from)}`);
    if (!path.startsWith(out + '/')) throw new Error('invalid_blog_path');
    const existing = await stat(path).catch(error => {
      if (error.code !== 'ENOENT') throw error;
      return null;
    });
    if (existing) throw new Error('blog_redirect_url_reserved');
  }
}
/** Local static hosting. Releases survive restart; incomplete builds never become visible. */
export async function startPublicationRunner(root, { controlPort = 8789, sitePort = 4327 } = {}) {
  let siteOrigin = `http://127.0.0.1:${sitePort}`;
  await mkdir(root, { recursive: true });
  let active = await readJson(join(root, 'active.json')).catch(() => null);
  let building = false;
  let child;
  const running = new Set();
  const keyOf = d => {
    if (!/^[0-9a-f-]{36}$/i.test(d?.operationId) || !Number.isSafeInteger(d.attempt) || d.attempt < 1 || !/^[0-9a-f]{64}$/.test(d.hash)) throw new Error('invalid_delivery');
    return `${d.operationId}-${d.attempt}`;
  };
  const result = (d, status, hash) => ({ status, operationId: d.operationId, attempt: d.attempt, hash: d.hash, receipt: `${keyOf(d)}:${hash}` });
  async function inspect(d) {
    const key = keyOf(d);
    const record = await readJson(join(root, key, 'record.json')).catch(() => null);
    if (record && record.hash !== d.hash) throw new Error('delivery_mismatch');
    if (record?.status === 'succeeded' || active?.key === key) return result(d, 'succeeded', record.releaseHash);
    if (record?.status === 'failed' || (record && !running.has(key))) return result(d, 'failed', record.releaseHash);
    return { status: 'unknown' };
  }
  async function build(body, key, dir, releaseHash) {
    const { delivery: d, redirects } = body;
    try {
      const out = join(dir, 'site');
      await new Promise((res, rej) => {
        child = spawn(process.execPath, [join(astro, 'node_modules/astro/bin/astro.mjs'), 'build', '--outDir', out], {
          cwd: astro, env: { ...process.env, CMS_EVENT_SNAPSHOT: '', CMS_RELEASE_SNAPSHOT: join(dir, 'snapshot.json'), CMS_BLOG_RELEASE_SNAPSHOT: join(dir, 'blogs.json'), CMS_SITE_ORIGIN: siteOrigin, TZ: 'Asia/Tokyo' },
          stdio: ['ignore', 'ignore', 'pipe'],
        });
        let error = ''; child.stderr.on('data', chunk => { error = (error + chunk).slice(-3000); });
        child.on('error', rej); child.on('exit', code => code === 0 ? res() : rej(new Error(`Astro build failed (${code}): ${error}`)));
      });
      await checkBlogPaths(out, body.blogs ?? [], redirects);
      await writeBlogAssets(out, body.assets ?? []);
      const target = resolve(out, `.${decodeURIComponent(d.routes.canonicalPath)}`, 'index.html');
      if (!target.startsWith(out + '/')) throw new Error('invalid_path');
      await stat(target);
      await atomic(join(out, '__release.json'), { releaseId: key, hash: releaseHash });
      const next = { key, releaseHash, redirects };
      await atomic(join(root, 'active.json'), next);
      active = next;
      await atomic(join(dir, 'record.json'), { hash: d.hash, releaseHash, status: 'succeeded' });
    } catch (error) {
      if (active?.key !== key) await atomic(join(dir, 'record.json'), { hash: d.hash, releaseHash, status: 'failed' });
      console.error('Local publication:', error.message);
    } finally { running.delete(key); building = false; child = undefined; }
  }
  const control = createServer(async (req, res) => {
    try {
      // No browser or cross-origin calls: only the loopback Worker may submit JSON.
      if (req.method !== 'POST' || req.headers.origin || req.headers['x-cms-runner'] !== 'local-publication' || req.headers['content-type'] !== 'application/json') { res.writeHead(403).end(); return; }
      let input = ''; for await (const chunk of req) { input += chunk; if (input.length > 64 * 1024 * 1024) throw new Error('too_large'); }
      const body = JSON.parse(input); const d = body.delivery; const key = keyOf(d);
      if (req.url !== '/deploy' && req.url !== '/inspect') { res.writeHead(404).end(); return; }
      if (req.url === '/deploy') {
        const dir = join(root, key);
        const prior = await readJson(join(dir, 'record.json')).catch(() => null);
        if (!prior) {
          if (building) { res.writeHead(409).end(); return; }
          if (digest(JSON.stringify(d.payload)) !== d.hash || !Array.isArray(body.redirects)) throw new Error('invalid_payload');
          building = true; running.add(key);
          try {
            await mkdir(dir, { recursive: true });
            const releaseHash = digest(JSON.stringify({ snapshot: body.snapshot, redirects: body.redirects, blogs: body.blogs ?? [], assets: body.assets ?? [] }));
            await atomic(join(dir, 'snapshot.json'), body.snapshot);
            await atomic(join(dir, 'blogs.json'), { blogs: body.blogs ?? [], assets: (body.assets ?? []).map(({ id, extension }) => ({ id, extension })) });
            await atomic(join(dir, 'record.json'), { hash: d.hash, releaseHash, status: 'building' });
            void build(body, key, dir, releaseHash);
          } catch (error) {
            running.delete(key);
            building = false;
            throw error;
          }
        }
      }
      res.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(await inspect(d)));
    } catch (error) { console.error('Local runner request:', error.message); res.writeHead(503).end(); }
  });
  const site = createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store'); res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
    try {
      const release = active;
      if (!release) { res.writeHead(404).end(); return; }
      const url = new URL(req.url, siteOrigin);
      const redirect = release.redirects.find(r => r.from === url.pathname);
      if (redirect) { res.writeHead(301, { Location: redirect.to }).end(); return; }
      const base = join(root, release.key, 'site');
      let path = resolve(base, `.${decodeURIComponent(url.pathname)}`);
      if (!path.startsWith(base + '/') && path !== base) throw new Error('invalid_path');
      if ((await stat(path)).isDirectory()) path = join(path, 'index.html');
      const bytes = await readFile(path);
      res.writeHead(200, { 'X-Content-Type-Options': 'nosniff', 'Content-Type': mime[extname(path)] ?? 'application/octet-stream', 'X-Publication-Release': release.key });
      res.end(req.method === 'HEAD' ? undefined : bytes);
    } catch { res.writeHead(404).end(); }
  });
  await Promise.all([new Promise((res, rej) => control.once('error', rej).listen(controlPort, '127.0.0.1', res)), new Promise((res, rej) => site.once('error', rej).listen(sitePort, '127.0.0.1', res))]);
  siteOrigin = `http://127.0.0.1:${site.address().port}`;
  const controlOrigin = `http://127.0.0.1:${control.address().port}`;
  console.log(`Published site: ${siteOrigin}`);
  return { siteOrigin, controlOrigin, async close() { child?.kill('SIGTERM'); await Promise.all([new Promise(resolve => control.close(resolve)), new Promise(resolve => site.close(resolve))]); } };
}
