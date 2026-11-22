// #337: read-only acquisition. Never creates CMS assets or replaces source URLs.
import { DatabaseSync } from 'node:sqlite';
import { createHash, randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import {
  mkdir,
  open,
  readFile,
  rename,
  rm,
  statfs,
  writeFile,
} from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import sharp from 'sharp';
import { buildInventory } from './inventory-wordpress-media.mjs';

const exec = promisify(execFile);
const MiB = 1024 ** 2;
const hash = (data) => createHash('sha256').update(data).digest('hex');
export function allowedURL(value) {
  const u = new URL(value);
  if (
    !['http:', 'https:'].includes(u.protocol) ||
    !['www.petiteadventurefilms.com', 'petiteadventurefilms.com'].includes(
      u.hostname,
    ) ||
    u.username ||
    u.password ||
    u.port ||
    !u.pathname.startsWith('/wp/wp-content/uploads/')
  )
    throw Error('unapproved_source');
  return u;
}
export function makePlan(inventory, inventoryHash, snapshotHash) {
  const byURL = new Map();
  function add(url, entry, role) {
    allowedURL(url);
    const job = byURL.get(url) ?? {
      url,
      sources: [],
      previouslyMissing: false,
    };
    if (role === 'referenced' && entry.remoteCheck?.ok === false)
      job.previouslyMissing = true;
    job.sources.push({
      role,
      storageKey: entry.storageKey,
      references: entry.references,
    });
    byURL.set(url, job);
  }
  for (const entry of inventory.entries) {
    for (const url of entry.sourceUrls) add(url, entry, 'referenced');
  }
  for (const entry of inventory.entries) {
    const u = new URL(entry.sourceUrl);
    if (/-\d+x\d+\.(jpe?g|png|gif|webp)$/i.test(u.pathname)) {
      u.pathname = u.pathname.replace(/-\d+x\d+(?=\.[^.]+$)/, '');
      add(u.href, entry, 'original-candidate');
    }
  }
  const priority = (job) =>
    job.previouslyMissing
      ? 0
      : job.sources.some((s) => s.role === 'original-candidate')
        ? 1
        : /\.pdf(?:[?#]|$)/i.test(job.url)
          ? 2
          : 3;
  const jobs = [...byURL.values()].sort((a, b) => priority(a) - priority(b));
  return { schemaVersion: 1, inventoryHash, snapshotHash, jobs };
}
async function fileHash(path) {
  const h = createHash('sha256');
  let bytes = 0;
  for await (const chunk of createReadStream(path)) {
    h.update(chunk);
    bytes += chunk.length;
  }
  return { sha256: h.digest('hex'), bytes };
}
export async function validateFile(path) {
  const file = await open(path, 'r');
  const magic = Buffer.alloc(5);
  try {
    await file.read(magic, 0, 5, 0);
  } finally {
    await file.close();
  }
  if (magic.toString() === '%PDF-') {
    const { stdout } = await exec('pdfinfo', [path], {
      timeout: 30000,
      maxBuffer: MiB,
    });
    const pages = Number(stdout.match(/^Pages:\s+(\d+)/m)?.[1]);
    if (!pages || pages > 2000) throw Error('invalid_pdf_page_count');
    const folder = path + '.decode';
    await mkdir(folder);
    try {
      const { stderr } = await exec(
        'pdftoppm',
        ['-r', '2', '-png', path, join(folder, 'page')],
        { timeout: 60000, maxBuffer: MiB },
      );
      if (/Syntax Error/i.test(stderr)) throw Error('invalid_pdf_syntax');
      return {
        format: 'pdf',
        mime: 'application/pdf',
        pages,
        decodeWarnings: stderr.trim(),
      };
    } finally {
      await rm(folder, { recursive: true, force: true });
    }
  }
  const options = {
    limitInputPixels: 40000000,
    failOn: 'warning',
    animated: true,
  };
  const meta = await sharp(path, options).metadata();
  if (!['jpeg', 'png', 'gif', 'webp'].includes(meta.format))
    throw Error('invalid_image_format');
  await sharp(path, options).stats();
  return {
    format: meta.format,
    mime: `image/${meta.format}`,
    width: meta.width,
    height: meta.height,
    pages: meta.pages ?? 1,
  };
}

export async function acquire({
  plan,
  cache,
  limit = Infinity,
  offline = false,
  fetcher = fetch,
  validator = validateFile,
  interval = 500,
  maxBytes = 20 * MiB,
  budget = 4096 * MiB,
  minFree = 5 * 1024 ** 3,
  timeout = 60000,
  pause = (ms) => new Promise((r) => setTimeout(r, ms)),
}) {
  await mkdir(cache, { recursive: true, mode: 0o700 });
  // Exclusive process lock. A crash leaves the lock for explicit, reviewed recovery.
  const lockPath = join(cache, 'acquisition.lock');
  const lock = await open(lockPath, 'wx', 0o600);
  await lock.writeFile(
    JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }),
  );
  await lock.sync();
  let db;
  try {
    db = new DatabaseSync(join(cache, 'acquisition.sqlite'));
    db.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;
      CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS jobs(id INTEGER PRIMARY KEY, url TEXT UNIQUE, source TEXT, state TEXT DEFAULT 'pending', attempts INTEGER DEFAULT 0, file TEXT, error TEXT);
      CREATE TABLE IF NOT EXISTS attempts(id INTEGER PRIMARY KEY, job INTEGER, started TEXT, ended TEXT, reservation INTEGER, received INTEGER, result TEXT);`);
    const get = (key) =>
      db.prepare('SELECT value FROM meta WHERE key=?').get(key)?.value;
    const set = (key, value) =>
      db
        .prepare('INSERT OR REPLACE INTO meta VALUES(?,?)')
        .run(key, String(value));
    const identity = hash(JSON.stringify(plan));
    if (get('identity') && get('identity') !== identity)
      throw Error('input_changed');
    if (!get('identity')) {
      db.exec('BEGIN IMMEDIATE');
      try {
        set('identity', identity);
        set('chargedBytes', 0);
        set('notBefore', 0);
        const insert = db.prepare('INSERT INTO jobs(url,source) VALUES(?,?)');
        for (const job of plan.jobs) {
          allowedURL(job.url);
          insert.run(job.url, JSON.stringify(job.sources));
        }
        db.exec('COMMIT');
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
      await writeFile(join(cache, 'plan.json'), JSON.stringify(plan, null, 2), {
        mode: 0o600,
      });
    }
    // In-flight reservations survive crashes; never refund an unknown byte count.
    db.exec(
      "UPDATE jobs SET state='retryable', error='interrupted_attempt' WHERE state='fetching'",
    );
    for (const job of db
      .prepare("SELECT * FROM jobs WHERE state='verified-local'")
      .all()) {
      const stored = JSON.parse(job.file);
      try {
        const actual = await fileHash(join(cache, stored.path));
        if (actual.sha256 !== stored.sha256 || actual.bytes !== stored.bytes)
          throw Error('cache_corrupt');
      } catch {
        db.prepare(
          "UPDATE jobs SET state='pending', error='cache_missing_or_corrupt' WHERE id=?",
        ).run(job.id);
      }
    }
    let stopReason = null,
      nextStart = Date.now(),
      queue = Promise.resolve();
    const permit = () => {
      const current = queue.then(async () => {
        const delay =
          Math.max(nextStart, Number(get('notBefore'))) - Date.now();
        if (delay > 30000) throw Error('server_cooldown');
        if (delay > 0) await pause(delay);
        nextStart = Date.now() + interval;
      });
      queue = current.catch(() => {});
      return current;
    };
    let count = 0,
      failures = 0;
    const take = () => {
      if (offline || stopReason || count >= limit) return null;
      const job = db
        .prepare(
          "SELECT * FROM jobs WHERE state IN ('pending','retryable') AND attempts<3 ORDER BY id LIMIT 1",
        )
        .get();
      if (!job) return null;
      db.prepare("UPDATE jobs SET state='claimed' WHERE id=?").run(job.id);
      count++;
      return job;
    };
    // A stopped process may have claimed work without opening a network request.
    db.exec("UPDATE jobs SET state='pending' WHERE state='claimed'");
    async function worker() {
      let job;
      while ((job = take())) {
        const temp = join(cache, randomUUID() + '.part');
        let reservationId,
          received = 0,
          handle,
          response;
        const report = { redirects: [] };
        let state = 'retryable',
          error = null,
          verified = null;
        try {
          const fs = await statfs(cache);
          if (fs.bavail * fs.bsize < minFree)
            throw Error('insufficient_disk_space');
          if (Number(get('chargedBytes')) + maxBytes > budget)
            throw Error('budget_exhausted');
          await permit();
          if (Number(get('chargedBytes')) + maxBytes > budget)
            throw Error('budget_exhausted');
          // Persist the whole request allowance before fetching. Refund only after a known outcome.
          db.exec('BEGIN IMMEDIATE');
          try {
            set('chargedBytes', Number(get('chargedBytes')) + maxBytes);
            reservationId = Number(
              db
                .prepare(
                  'INSERT INTO attempts(job,started,reservation) VALUES(?,?,?)',
                )
                .run(job.id, new Date().toISOString(), maxBytes)
                .lastInsertRowid,
            );
            db.prepare(
              "UPDATE jobs SET state='fetching', attempts=attempts+1 WHERE id=?",
            ).run(job.id);
            db.exec('COMMIT');
          } catch (e) {
            db.exec('ROLLBACK');
            throw e;
          }
          let url = job.url;
          const signal = AbortSignal.timeout(timeout);
          for (let n = 0; n <= 5; n++) {
            allowedURL(url);
            if (n > 0) await permit();
            response = await fetcher(url, {
              redirect: 'manual',
              signal,
              headers: { 'User-Agent': 'PAF-Media-Preservation/1.0' },
            });
            if (![301, 302, 303, 307, 308].includes(response.status)) break;
            const location = response.headers.get('location');
            await response.body?.cancel();
            if (!location || n === 5) throw Error('invalid_redirect');
            const target = new URL(location, url).href;
            allowedURL(target);
            report.redirects.push({
              from: url,
              to: target,
              status: response.status,
            });
            url = target;
          }
          Object.assign(report, {
            finalURL: url,
            status: response.status,
            contentType: response.headers.get('content-type'),
            contentLength: response.headers.get('content-length'),
            etag: response.headers.get('etag'),
            lastModified: response.headers.get('last-modified'),
          });
          if (!response.ok) {
            await response.body?.cancel();
            state = [404, 410].includes(response.status)
              ? 'missing'
              : response.status === 408 ||
                  response.status === 429 ||
                  response.status >= 500
                ? 'retryable'
                : 'rejected';
            error = `http_${response.status}`;
            if (state === 'retryable') {
              const h = response.headers.get('retry-after');
              const backoff =
                1000 * 2 ** job.attempts + Math.floor(Math.random() * 250);
              const delay = h
                ? /^\d+$/.test(h)
                  ? Number(h) * 1000
                  : Math.max(0, Date.parse(h) - Date.now())
                : 0;
              set(
                'notBefore',
                Math.max(
                  Number(get('notBefore')),
                  Date.now() + Math.max(backoff, delay || 0),
                ),
              );
            }
          } else {
            if (Number(report.contentLength) > maxBytes)
              throw Error('file_limit');
            const transportHash = createHash('sha256');
            handle = await open(temp, 'wx', 0o600);
            for await (const chunk of response.body) {
              received += chunk.length;
              if (received > maxBytes) throw Error('file_limit');
              transportHash.update(chunk);
              await handle.writeFile(chunk);
            }
            await handle.sync();
            await handle.close();
            handle = null;
            if (
              report.contentLength !== null &&
              !response.headers.get('content-encoding') &&
              Number(report.contentLength) !== received
            )
              throw Error('length_mismatch');
            const metadata = await validator(temp);
            const digest = await fileHash(temp);
            if (
              digest.bytes !== received ||
              digest.sha256 !== transportHash.digest('hex')
            )
              throw Error('disk_checksum');
            const filename =
              digest.sha256 +
              '.' +
              (metadata.format === 'jpeg' ? 'jpg' : metadata.format);
            const destination = join(cache, 'blobs', filename);
            await mkdir(join(cache, 'blobs'), { recursive: true });
            try {
              const existing = await fileHash(destination);
              if (existing.sha256 !== digest.sha256)
                await rename(
                  destination,
                  destination + '.corrupt.' + randomUUID(),
                );
            } catch (e) {
              if (e.code !== 'ENOENT') throw e;
            }
            await rename(temp, destination);
            const directory = await open(join(cache, 'blobs'), 'r');
            try {
              await directory.sync();
            } finally {
              await directory.close();
            }
            verified = { ...digest, ...metadata, path: 'blobs/' + filename };
            state = 'verified-local';
          }
        } catch (e) {
          error = e.message;
          if (
            /budget_exhausted|insufficient_disk_space|server_cooldown/.test(
              error,
            )
          ) {
            stopReason = error;
            state = 'pending';
          } else if (
            /unapproved_source|invalid_redirect|file_limit|invalid_|Input buffer|unsupported|corrupt|premature|pixel limit|pdfinfo|pdftoppm/i.test(
              error,
            )
          )
            state = 'rejected';
          else {
            state = 'retryable';
            set(
              'notBefore',
              Math.max(
                Number(get('notBefore')),
                Date.now() + 1000 * 2 ** job.attempts,
              ),
            );
          }
        } finally {
          if (handle) await handle.close();
          await response?.body?.cancel().catch(() => {});
          await rm(temp, { force: true });
        }
        db.exec('BEGIN IMMEDIATE');
        try {
          if (reservationId) {
            set(
              'chargedBytes',
              Number(get('chargedBytes')) - maxBytes + received,
            );
            db.prepare(
              'UPDATE attempts SET ended=?, received=?, result=? WHERE id=?',
            ).run(
              new Date().toISOString(),
              received,
              JSON.stringify({ ...report, state, error }),
              reservationId,
            );
          }
          db.prepare('UPDATE jobs SET state=?,file=?,error=? WHERE id=?').run(
            state,
            verified ? JSON.stringify(verified) : null,
            error,
            job.id,
          );
          db.exec('COMMIT');
        } catch (e) {
          db.exec('ROLLBACK');
          throw e;
        }
        failures = state === 'retryable' ? failures + 1 : 0;
        if (failures >= 6) stopReason = 'consecutive_failures';
        if (count % 100 === 0)
          console.log(
            JSON.stringify({
              processed: count,
              chargedBytes: Number(get('chargedBytes')),
              state,
            }),
          );
      }
    }
    // Observe both workers before closing the database or releasing the process lock.
    const workers = await Promise.allSettled([worker(), worker()]);
    const failure = workers.find((r) => r.status === 'rejected');
    if (failure) throw failure.reason;
    const jobs = db
      .prepare('SELECT * FROM jobs ORDER BY id')
      .all()
      .map((j) => ({
        ...j,
        source: JSON.parse(j.source),
        file: j.file ? JSON.parse(j.file) : null,
      }));
    const counts = {};
    for (const j of jobs) counts[j.state] = (counts[j.state] ?? 0) + 1;
    const result = {
      inputHash: identity,
      checkedAt: new Date().toISOString(),
      stopReason,
      chargedBytes: Number(get('chargedBytes')),
      knownReceivedBytes: db
        .prepare('SELECT coalesce(sum(received),0) AS n FROM attempts')
        .get().n,
      unsettledReservationBytes: db
        .prepare(
          'SELECT coalesce(sum(reservation),0) AS n FROM attempts WHERE ended IS NULL',
        )
        .get().n,
      counts,
      jobs,
    };
    const exportTemp = join(cache, 'result.json.tmp');
    await writeFile(exportTemp, JSON.stringify(result, null, 2), {
      mode: 0o600,
    });
    await rename(exportTemp, join(cache, 'result.json'));
    return result;
  } finally {
    db?.close();
    await lock.close();
    await rm(lockPath, { force: true });
  }
}

export function parseArguments(args) {
  let offline = false,
    limit = Infinity;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--offline' && !offline) offline = true;
    else if (
      args[i] === '--limit' &&
      limit === Infinity &&
      /^\d+$/.test(args[i + 1] ?? '')
    ) {
      limit = Number(args[++i]);
      if (!Number.isSafeInteger(limit) || limit < 1)
        throw Error('invalid_limit');
    } else throw Error('invalid_argument: ' + args[i]);
  }
  return { offline, limit };
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const root = resolve(fileURLToPath(new URL('../..', import.meta.url)));
  const inventoryData = await readFile(
    join(root, 'astro/data/wordpress-media-inventory.json'),
  );
  const snapshot = await readFile(
    join(root, 'astro/data/wordpress-export.json'),
  );
  const inventory = JSON.parse(inventoryData);
  const rebuilt = buildInventory(JSON.parse(snapshot));
  const entries = (value) =>
    value.entries
      .map((e) => [e.storageKey, [...e.sourceUrls].sort(), e.references])
      .sort((a, b) => a[0].localeCompare(b[0]));
  if (JSON.stringify(entries(inventory)) !== JSON.stringify(entries(rebuilt)))
    throw Error('snapshot_inventory_mismatch');
  const plan = makePlan(inventory, hash(inventoryData), hash(snapshot));
  const cache = join(
    root,
    '.local',
    'issue-337-media',
    hash(JSON.stringify(plan)).slice(0, 16),
  );
  const { offline, limit } = parseArguments(process.argv.slice(2));
  if (!offline) {
    await exec('pdfinfo', ['-v']);
    await exec('pdftoppm', ['-v']);
  }
  const result = await acquire({ plan, cache, limit, offline });
  console.log(
    JSON.stringify({
      cache,
      counts: result.counts,
      chargedBytes: result.chargedBytes,
      stopReason: result.stopReason,
    }),
  );
  if (
    Object.keys(result.counts).some(
      (k) => !['verified-local', 'missing'].includes(k),
    )
  )
    process.exitCode = 2;
}
