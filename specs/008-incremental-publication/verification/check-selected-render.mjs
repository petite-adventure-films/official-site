// Local design probe only: never uploads or changes the normal Astro configuration.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import {
  mkdtemp,
  readFile,
  writeFile,
  readdir,
  mkdir,
  copyFile,
  rm,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const astro = join(root, 'astro');
const scratch = await mkdtemp(join(tmpdir(), 'paf-413-render-'));
const config = join(scratch, 'probe.config.mjs');
const input = join(scratch, 'events.json');
const trace = join(scratch, 'trace.json');
await writeFile(
  config,
  `import base from ${JSON.stringify(pathToFileURL(join(astro, 'astro.config.mjs')).href)};
import {writeFileSync} from 'node:fs';
const selected = process.env.PAF_PROBE_TARGETS ? new Set(JSON.parse(process.env.PAF_PROBE_TARGETS)) : null;
const trace = {candidates: 0, selected: [], rendered: []};
const normalized = p => p.endsWith('/') || p.endsWith('.html') ? p : p + '/';
export default {...base, integrations: [...base.integrations, {name:'paf-design-probe',hooks:{
 'astro:build:start': ({setPrerenderer}) => setPrerenderer(defaultRenderer => ({
  ...defaultRenderer, name:'paf-selected-probe',
  async getStaticPaths() {
   const result=await defaultRenderer.getStaticPaths();
   const all=Array.isArray(result) ? result : result.paths;
   trace.candidates=all.length;
   const paths=all.filter(p => !selected || selected.has(normalized(p.pathname)));
   trace.selected=paths.map(p=>normalized(p.pathname)).sort();
   return Array.isArray(result) ? paths : {...result,paths};
  },
  async render(request, options) {
   trace.rendered.push(normalized(new URL(request.url).pathname));
   return defaultRenderer.render(request,options);
  }
 })),
 'astro:build:done': () => writeFileSync(process.env.PAF_PROBE_TRACE,JSON.stringify(trace))
}}]};`,
);
const fixture = JSON.parse(
  await readFile(join(astro, 'fixtures/cms-events.json'), 'utf8'),
);
const original = '/events/cms-sample-screening/';
const remaining = '/events/cms-sample-online/';
async function htmlFiles(folder, prefix = '') {
  const result = [];
  for (const e of await readdir(join(folder, prefix), {
    withFileTypes: true,
  })) {
    const p = join(prefix, e.name);
    if (e.isDirectory()) result.push(...(await htmlFiles(folder, p)));
    else if (e.isFile() && p.endsWith('.html')) result.push(p);
  }
  return result.sort();
}
async function hashes(folder) {
  const map = new Map();
  for (const p of await htmlFiles(folder))
    map.set(
      p,
      createHash('sha256')
        .update(await readFile(join(folder, p)))
        .digest('hex'),
    );
  return map;
}
const pathFile = (p) => p.slice(1) + 'index.html';
async function build(name, snapshot, targets) {
  const out = join(scratch, name);
  await writeFile(input, JSON.stringify(snapshot));
  const env = {
    ...process.env,
    CMS_EVENT_SNAPSHOT: '',
    CMS_RELEASE_SNAPSHOT: input,
    CMS_BLOG_RELEASE_SNAPSHOT: '',
    CMS_SITE_ORIGIN: 'https://example.invalid',
    PAF_PROBE_TRACE: trace,
    PAF_PROBE_TARGETS: targets ? JSON.stringify(targets) : '',
  };
  // Do not pass deployment credentials to the design build.
  for (const key of Object.keys(env))
    if (/TOKEN|SECRET|PASSWORD|ACCESS_KEY/i.test(key)) delete env[key];
  try {
    const log = execFileSync(
      process.execPath,
      [
        join(astro, 'node_modules/astro/bin/astro.mjs'),
        'build',
        '--root',
        astro,
        '--config',
        relative(astro, config),
        '--outDir',
        out,
      ],
      {
        cwd: astro,
        env,
        encoding: 'utf8',
        maxBuffer: 8 * 1024 * 1024,
        timeout: 180000,
      },
    );
    await writeFile(join(scratch, name + '.log'), log);
  } catch (error) {
    await writeFile(
      join(scratch, name + '.log'),
      String(error.stdout ?? '') + '\n' + String(error.stderr ?? ''),
    );
    throw Error(`Local build failed; see ${join(scratch, name + '.log')}`);
  }
  return {
    out,
    hashes: await hashes(out),
    trace: JSON.parse(await readFile(trace, 'utf8')),
  };
}
const baseline = await build('baseline', fixture);
const cases = [
  {
    name: 'title',
    targets: ['/events/', original],
    remove: [],
    change: (s) => {
      s.events[0].payload.title += '（変更確認）';
    },
  },
  {
    name: 'add',
    targets: ['/events/', '/events/cms-sample-added/'],
    remove: [],
    change: (s) => {
      const e = structuredClone(s.events[0]);
      e.id = 'local-added';
      e.publishedAt = '2026-11-22T00:00:00.000Z';
      e.payload.slug = 'cms-sample-added';
      s.events.push(e);
    },
  },
  {
    name: 'slug',
    targets: ['/events/', '/events/cms-sample-renamed/'],
    remove: [original],
    change: (s) => {
      s.events[0].payload.slug = 'cms-sample-renamed';
    },
  },
  {
    name: 'unpublish',
    targets: ['/events/', remaining],
    remove: [original],
    change: (s) => {
      s.events.shift();
    },
  },
];
const results = [];
for (const c of cases) {
  const snapshot = structuredClone(fixture);
  c.change(snapshot);
  const full = await build(c.name + '-full', snapshot);
  const partial = await build(c.name + '-selected', snapshot, c.targets);
  assert.deepEqual(partial.trace.selected, [...c.targets].sort());
  assert.deepEqual([...partial.trace.rendered].sort(), [...c.targets].sort());
  const combined = join(scratch, c.name + '-combined');
  await mkdir(combined);
  const removed = new Set(c.remove.map(pathFile));
  for (const [p] of baseline.hashes)
    if (!removed.has(p)) {
      await mkdir(join(combined, p, '..'), { recursive: true });
      await copyFile(join(baseline.out, p), join(combined, p));
    }
  for (const [p] of partial.hashes) {
    await mkdir(join(combined, p, '..'), { recursive: true });
    await copyFile(join(partial.out, p), join(combined, p));
  }
  const merged = await hashes(combined);
  assert.deepEqual([...merged].sort(), [...full.hashes].sort());
  const changed = [...full.hashes]
    .filter(([p, h]) => baseline.hashes.get(p) !== h)
    .map(([p]) => p);
  const deleted = [...baseline.hashes.keys()].filter(
    (p) => !full.hashes.has(p),
  );
  results.push({
    case: c.name,
    fullHTML: full.hashes.size,
    rendered: partial.trace.rendered.sort(),
    changedHTML: changed,
    removedHTML: deleted,
    retainedUnchangedHTML: full.hashes.size - changed.length,
    combinedMatchesFull: true,
  });
  console.log(JSON.stringify(results.at(-1)));
  // Retain logs and evidence, not redundant copies of all public assets.
  for (const p of [full.out, partial.out, combined])
    await rm(p, { recursive: true });
}
const result = {
  checkedAt: new Date().toISOString(),
  astro: JSON.parse(
    await readFile(join(astro, 'node_modules/astro/package.json'), 'utf8'),
  ).version,
  baselineHTML: baseline.hashes.size,
  cases: results,
  scope:
    'Explicit event route selection and HTML composition only. No automatic impact planner, archive redesign, redirect/sitemap/asset composition or Cloudflare deployment tested.',
};
await writeFile(
  new URL('./selected-render-result.json', import.meta.url),
  JSON.stringify(result, null, 2) + '\n',
);
await rm(baseline.out, { recursive: true });
console.log(
  JSON.stringify({ logs: scratch, result: 'selected-render-result.json' }),
);
