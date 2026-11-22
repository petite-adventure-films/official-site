import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import sharp from 'sharp';
import {
  acquire,
  allowedURL,
  makePlan,
  validateFile,
} from './acquire-wordpress-media.mjs';
const base = 'https://www.petiteadventurefilms.com/wp/wp-content/uploads/';
const png = await sharp({
  create: { width: 2, height: 2, channels: 3, background: 'red' },
})
  .png()
  .toBuffer();
const plan = (names = ['one.png']) => ({
  jobs: names.map((n) => ({
    url: base + n,
    sources: [{ role: 'referenced' }],
  })),
});
async function scenario(t, options = {}) {
  const cache = await mkdtemp(join(tmpdir(), 'paf-acquire-test-'));
  t.after(() => rm(cache, { recursive: true, force: true }));
  return {
    cache,
    plan: plan(),
    interval: 0,
    minFree: 0,
    pause: async () => {},
    fetcher: async () => new Response(png),
    ...options,
  };
}
test('resumes verified bytes without fetch and repairs a corrupt cache', async (t) => {
  let calls = 0;
  const args = await scenario(t, {
    plan: plan(['one.png', 'two.png']),
    fetcher: async () => {
      calls++;
      return new Response(png);
    },
  });
  let r = await acquire({ ...args, limit: 1 });
  assert.deepEqual(r.counts, { 'verified-local': 1, pending: 1 });
  r = await acquire(args);
  assert.equal(calls, 2);
  assert.equal(r.counts['verified-local'], 2);
  const before = r.chargedBytes;
  r = await acquire({ ...args, offline: true });
  assert.equal(calls, 2);
  assert.equal(r.chargedBytes, before);
  await writeFile(join(args.cache, r.jobs[0].file.path), 'broken');
  r = await acquire(args);
  assert.equal(calls, 4);
  assert.equal(r.counts['verified-local'], 2);
});
test('input changes and concurrent runs are refused', async (t) => {
  const args = await scenario(t);
  await acquire(args);
  await assert.rejects(
    acquire({ ...args, plan: plan(['different.png']) }),
    /input_changed/,
  );
  await writeFile(join(args.cache, 'acquisition.lock'), 'other owner');
  await assert.rejects(acquire(args), /EEXIST/);
  assert.equal(
    await readFile(join(args.cache, 'acquisition.lock'), 'utf8'),
    'other owner',
  );
});
test('404 is retained separately from a candidate and HTML is not accepted as an image', async (t) => {
  const args = await scenario(t, {
    plan: plan(['missing.png', 'candidate.png', 'error.png']),
    fetcher: async (url) =>
      url.includes('missing')
        ? new Response('gone', { status: 404 })
        : url.includes('error')
          ? new Response('<html>error</html>')
          : new Response(png),
  });
  const r = await acquire(args);
  assert.equal(r.counts.missing, 1);
  assert.equal(r.counts['verified-local'], 1);
  assert.equal(r.counts.rejected, 1);
});
test('unsafe sources and redirects are rejected before a request to another host', async (t) => {
  for (const u of [
    'https://evil.test/wp/wp-content/uploads/a.png',
    base.replace('https://', 'https://user:pass@'),
    'file:///tmp/a',
    'https://www.petiteadventurefilms.com/admin',
  ])
    assert.throws(() => allowedURL(u));
  let calls = 0;
  const args = await scenario(t, {
    fetcher: async () => {
      calls++;
      return new Response(null, {
        status: 302,
        headers: { location: 'https://evil.test/a.png' },
      });
    },
  });
  const r = await acquire(args);
  assert.equal(r.counts.rejected, 1);
  assert.equal(calls, 1);
});
test('byte limits and budget stop do not publish partial files', async (t) => {
  const args = await scenario(t, { maxBytes: 10, budget: 30 });
  let r = await acquire(args);
  assert.equal(r.counts.rejected, 1);
  assert.equal(r.jobs[0].file, null);
  const other = await scenario(t, {
    maxBytes: 100,
    budget: 99,
    fetcher: () => {
      throw Error('must not fetch');
    },
  });
  r = await acquire(other);
  assert.equal(r.stopReason, 'budget_exhausted');
  assert.equal(r.counts.pending, 1);
  assert.equal(r.chargedBytes, 0);
});
test('503 retries are capped and server cooldown survives restarting', async (t) => {
  let calls = 0;
  const args = await scenario(t, {
    fetcher: async () => {
      calls++;
      return new Response(null, { status: 503 });
    },
  });
  let r = await acquire(args);
  assert.equal(calls, 3);
  assert.equal(r.jobs[0].attempts, 3);
  r = await acquire(args);
  assert.equal(calls, 3);
  const slow = await scenario(t, {
    fetcher: async () =>
      new Response(null, { status: 429, headers: { 'retry-after': '3600' } }),
  });
  r = await acquire(slow);
  assert.equal(r.stopReason, 'server_cooldown');
  const attempts = r.jobs[0].attempts;
  r = await acquire({
    ...slow,
    fetcher: () => {
      throw Error('must not fetch');
    },
  });
  assert.equal(r.stopReason, 'server_cooldown');
  assert.equal(r.jobs[0].attempts, attempts);
  assert.equal(attempts, 1);
});
test('interrupted reservations are retained conservatively on resume', async (t) => {
  const args = await scenario(t, { maxBytes: 1000, budget: 10000 });
  await acquire({ ...args, limit: 0 });
  const db = new DatabaseSync(join(args.cache, 'acquisition.sqlite'));
  db.exec(
    "UPDATE jobs SET state='fetching', attempts=1; UPDATE meta SET value='1000' WHERE key='chargedBytes'; INSERT INTO attempts(job,started,reservation) VALUES(1,'interrupted',1000)",
  );
  db.close();
  const r = await acquire(args);
  assert.equal(r.counts['verified-local'], 1);
  assert.equal(r.chargedBytes, 1000 + png.length);
  assert.equal(r.knownReceivedBytes, png.length);
  assert.equal(r.unsettledReservationBytes, 1000);
});
test('full image validation refuses truncated files', async (t) => {
  const args = await scenario(t);
  const path = join(args.cache, 'truncated');
  await writeFile(path, png.subarray(0, 40));
  await assert.rejects(validateFile(path));
});
test('exact aliases remain separate and original candidates do not replace source jobs', () => {
  const e = {
    sourceUrl: base + 'a-300x200.jpg',
    sourceUrls: [
      base + 'a-300x200.jpg',
      base.replace('https:', 'http:') + 'a-300x200.jpg',
    ],
    storageKey: 'wordpress/a-300x200.jpg',
    references: [{ legacyId: 1 }],
  };
  const p = makePlan({ entries: [e] }, 'inventory', 'snapshot');
  assert.equal(p.jobs.length, 3);
  assert.equal(p.jobs[0].url, base + 'a.jpg');
  assert.equal(p.jobs[0].sources[0].role, 'original-candidate');
});
test('concurrent workers cannot reserve the same remaining budget', async (t) => {
  let active = 0,
    maxActive = 0;
  const args = await scenario(t, {
    plan: plan(['one.png', 'two.png']),
    maxBytes: 100,
    budget: 100,
    fetcher: async () => {
      active++;
      maxActive = Math.max(maxActive, active);
      await new Promise((r) => setTimeout(r, 30));
      active--;
      return new Response(png);
    },
  });
  const r = await acquire(args);
  assert.equal(maxActive, 1);
  assert.equal(r.counts['verified-local'], 1);
  assert.equal(r.counts.pending, 1);
  assert.equal(r.stopReason, 'budget_exhausted');
});
test('cut response bodies remain unresolved and can never become verified files', async (t) => {
  const args = await scenario(t, {
    fetcher: async () => ({
      status: 200,
      ok: true,
      headers: new Headers(),
      body: {
        async *[Symbol.asyncIterator]() {
          yield png.subarray(0, 20);
          throw Error('connection lost');
        },
        cancel: async () => {},
      },
    }),
  });
  const r = await acquire(args);
  assert.equal(r.counts.retryable, 1);
  assert.equal(r.jobs[0].file, null);
  assert.equal(r.chargedBytes, 60);
});
test('summary keeps missing originals and conflicting aliases visible', async () => {
  const { summarize } = await import('./summarize-wordpress-acquisition.mjs');
  const source = [
    { role: 'referenced', storageKey: 'wordpress/a', references: [] },
  ];
  const job = (url, sha256) => ({
    url,
    source,
    state: 'verified-local',
    file: { sha256, bytes: 10, format: 'png' },
  });
  const r = summarize({
    jobs: [
      job('http:a', 'one'),
      job('https:a', 'two'),
      {
        url: 'missing',
        source: [{ role: 'referenced', storageKey: 'wordpress/b' }],
        state: 'missing',
        file: null,
        error: 'http_404',
      },
    ],
    counts: { 'verified-local': 2, missing: 1 },
  });
  assert.equal(r.aliases.differentHash.length, 1);
  assert.equal(r.unresolved.length, 1);
  assert.equal(r.pathsWithAllURLsVerified, 1);
  assert.equal(r.uniqueBlobs, 2);
});
test('unknown command flags cannot silently start a network run', async () => {
  const { parseArguments } = await import('./acquire-wordpress-media.mjs');
  assert.deepEqual(parseArguments(['--offline']), {
    offline: true,
    limit: Infinity,
  });
  assert.deepEqual(parseArguments(['--limit', '70']), {
    offline: false,
    limit: 70,
  });
  for (const args of [
    ['--offine'],
    ['--limit'],
    ['--limit', '0'],
    ['--limit', '0.5'],
    ['--offline', '--offline'],
  ])
    assert.throws(() => parseArguments(args));
});
