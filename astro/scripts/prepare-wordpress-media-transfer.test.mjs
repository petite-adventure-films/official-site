import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { buildInventory } from './inventory-wordpress-media.mjs';
import { makePlan } from './acquire-wordpress-media.mjs';
import { prepareTransfer, writeTransfer } from './prepare-wordpress-media-transfer.mjs';
const base = 'https://www.petiteadventurefilms.com/wp/wp-content/uploads/2026/';
const hash = (b) => createHash('sha256').update(b).digest('hex');
const red = await sharp({ create: { width: 2, height: 3, channels: 3, background: 'red' } })
  .png()
  .toBuffer();
const blue = await sharp({ create: { width: 2, height: 3, channels: 3, background: 'blue' } })
  .png()
  .toBuffer();
async function fixture(t, urls = [base + 'one.png'], choose = () => red) {
  const cache = await mkdtemp(join(tmpdir(), 'paf-transfer-test-'));
  t.after(() => rm(cache, { recursive: true, force: true }));
  await mkdir(join(cache, 'blobs'));
  const snapshotBytes = Buffer.from(
    JSON.stringify({
      schemaVersion: 1,
      content: {
        blogs: [
          {
            id: 1,
            name: 'sample',
            title: '原文',
            content: urls.map((url) => `<img src="${url}">`).join(''),
          },
        ],
        news: [],
        events: [],
        media: [],
        channels: [],
      },
    }),
  );
  const inventoryBytes = Buffer.from(JSON.stringify(buildInventory(JSON.parse(snapshotBytes))));
  const plan = makePlan(JSON.parse(inventoryBytes), hash(inventoryBytes), hash(snapshotBytes));
  const report = { inputHash: hash(JSON.stringify(plan)), stopReason: null, counts: {}, jobs: [] };
  for (const job of plan.jobs) {
    const bytes = choose(job.url);
    let file = null;
    if (bytes) {
      const meta = await sharp(bytes).metadata();
      file = {
        sha256: hash(bytes),
        bytes: bytes.length,
        format: 'png',
        mime: 'image/png',
        width: meta.width,
        height: meta.height,
        pages: 1,
        path: `blobs/${hash(bytes)}.png`,
      };
      await writeFile(join(cache, file.path), bytes);
    }
    const state = file ? 'verified-local' : 'missing';
    report.jobs.push({
      url: job.url,
      source: job.sources,
      state,
      file,
      error: file ? null : 'http_404',
    });
    report.counts[state] = (report.counts[state] ?? 0) + 1;
  }
  const run = () =>
    prepareTransfer({
      cache,
      snapshotBytes,
      inventoryBytes,
      reportBytes: Buffer.from(JSON.stringify(report)),
    });
  return { cache, snapshotBytes, inventoryBytes, report, run };
}
test('deduplicates verified bytes but retains every exact URL, missing source and unapproved candidate', async (t) => {
  const f = await fixture(
    t,
    [base + 'one.png', (base + 'one.png').replace('https:', 'http:'), base + 'missing-300x200.png'],
    (url) =>
      url.endsWith('missing-300x200.png') ? null : url.endsWith('missing.png') ? blue : red,
  );
  const before = JSON.stringify(f.report);
  const a = await f.run(),
    b = await f.run();
  assert.deepEqual(a, b);
  assert.equal(JSON.stringify(f.report), before);
  assert.equal(a.summary.plannedObjects, 1);
  assert.equal(a.summary.candidateOnlyObjects, 1);
  assert.equal(a.summary.missingUrls, 1);
  assert.equal(a.summary.urls, 4);
  assert.equal(a.summary.plannedPaths, 1);
  assert.equal(a.urls.find((u) => u.url.endsWith('missing-300x200.png')).state, 'missing');
  assert.equal(a.urls.find((u) => u.url.endsWith('missing.png')).state, 'candidate-only');
  assert.equal(
    a.paths.find((p) => p.legacyStorageKey.endsWith('missing-300x200.png')).storageKey,
    undefined,
  );
  assert.ok(a.objects.every((o) => !Object.hasOwn(o, 'assetId')));
  assert.equal(
    a.objects.find((o) => o.state === 'planned').original.storageKey,
    `originals/${hash(red).slice(0, 2)}/${hash(red)}.png`,
  );
});
test('refuses changed inputs, omitted/duplicate jobs, altered references and unfinished acquisition', async (t) => {
  for (const mutate of [
    (r) => {
      r.inputHash = 'other';
    },
    (r) => {
      r.jobs.pop();
    },
    (r) => {
      r.jobs[1] = r.jobs[0];
    },
    (r) => {
      r.jobs[0].source[0].references = [];
    },
    (r) => {
      r.jobs[0].state = 'retryable';
    },
    (r) => {
      r.counts['verified-local']++;
    },
  ]) {
    const f = await fixture(t, [base + 'one.png', base + 'two.png']);
    mutate(f.report);
    await assert.rejects(f.run());
  }
});
test('refuses corrupted or missing local bytes and incorrect recorded metadata', async (t) => {
  const f = await fixture(t);
  const path = join(f.cache, f.report.jobs[0].file.path);
  const corrupt = Buffer.from(red);
  corrupt[corrupt.length - 1] ^= 1;
  await writeFile(path, corrupt);
  await assert.rejects(f.run(), /checksum/);
  await writeFile(path, red);
  f.report.jobs[0].file.width = 999;
  await assert.rejects(f.run(), /metadata/);
  f.report.jobs[0].file.width = 2;
  await rm(path);
  await assert.rejects(f.run(), /ENOENT/);
});
test('rejects unexpected paths and symbolic-link substitution', async (t) => {
  const f = await fixture(t);
  const file = f.report.jobs[0].file,
    path = join(f.cache, file.path);
  file.path = '../private.png';
  await assert.rejects(f.run(), /unexpected_blob_path/);
  file.path = `blobs/${file.sha256}.png`;
  await rm(path);
  await writeFile(join(f.cache, 'other.png'), red);
  await symlink(join(f.cache, 'other.png'), path);
  await assert.rejects(f.run(), /invalid_blob_file/);
});
test('stops when HTTP/HTTPS aliases have different verified content', async (t) => {
  const f = await fixture(
    t,
    [base + 'one.png', (base + 'one.png').replace('https:', 'http:')],
    (url) => (url.startsWith('https:') ? red : blue),
  );
  await assert.rejects(f.run(), /alias_hash_mismatch/);
});
test('a candidate sharing bytes with a referenced asset never resolves a missing source automatically', async (t) => {
  const f = await fixture(t, [base + 'one.png', base + 'missing-300x200.png'], (url) =>
    url.endsWith('missing-300x200.png') ? null : red,
  );
  const r = await f.run();
  assert.equal(r.summary.plannedObjects, 1);
  assert.equal(r.summary.candidateOnlyObjects, 0);
  assert.equal(r.urls.find((u) => u.url.endsWith('missing.png')).state, 'candidate-only');
  assert.equal(
    r.paths.find((p) => p.legacyStorageKey.endsWith('missing-300x200.png')).state,
    'blocked',
  );
});
test('keeps files exceeding the existing CMS upload limit out of the planned set', async (t) => {
  const big = await sharp({ create: { width: 2000, height: 2000, channels: 3, background: 'red' } })
    .png({ compressionLevel: 0 })
    .toBuffer();
  assert.ok(big.length > 10 * 1024 * 1024);
  const f = await fixture(t, [base + 'large.png'], () => big);
  const r = await f.run();
  assert.equal(r.summary.uploadLimitBlockedObjects, 1);
  assert.equal(r.summary.plannedObjects, 0);
  assert.equal(r.paths[0].state, 'blocked');
});
test('never overwrites an existing transfer manifest', async (t) => {
  const f = await fixture(t);
  const path = join(f.cache, 'manifest.json');
  const r = await f.run();
  await writeTransfer(path, r);
  const before = await readFile(path);
  await assert.rejects(writeTransfer(path, {}), /EEXIST/);
  assert.deepEqual(await readFile(path), before);
});
