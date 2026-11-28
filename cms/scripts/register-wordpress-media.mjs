// D1 reservations + immutable R2 bytes + verified CMS asset records; no articles or publication.
import { createHash, randomUUID } from 'node:crypto';
import { readFile, realpath, lstat, writeFile } from 'node:fs/promises';
import { resolve, join, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  mediaTypes,
  maxMediaBytes,
} from '../../packages/content-schema/media-policy.ts';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const check = (condition, message) => {
  if (!condition) throw Error(message);
};
export async function registerMedia({
  report,
  db,
  bucket,
  readBytes,
  limit = Infinity,
  concurrency = 32,
}) {
  check(
    report.schemaVersion === 'wordpress-media-usage-verification/v1',
    'invalid_report',
  );
  check(
    report.urls.every((row) =>
      [
        'verified-local',
        'recovery-verified-local',
        'approved-exclusion',
      ].includes(row.evidence.state),
    ),
    'unresolved_sources',
  );
  const objects = new Map();
  for (const row of report.urls) {
    const e = row.evidence;
    if (e.state === 'approved-exclusion') continue;
    check(
      /^[a-f0-9]{64}$/.test(e.sha256) &&
        Object.hasOwn(mediaTypes, e.mime) &&
        Number.isSafeInteger(e.sizeBytes) &&
        e.sizeBytes > 0 &&
        e.sizeBytes <= maxMediaBytes(e.mime),
      'invalid_media',
    );
    const metadata = {
      sha256: e.sha256,
      mimeType: e.mime,
      sizeBytes: e.sizeBytes,
      ...(e.mime === 'application/pdf'
        ? {}
        : { width: e.width, height: e.height }),
    };
    if (e.mime !== 'application/pdf')
      check(
        Number.isSafeInteger(e.width) &&
          e.width > 0 &&
          Number.isSafeInteger(e.height) &&
          e.height > 0,
        'invalid_dimensions',
      );
    if (objects.has(e.sha256))
      check(
        JSON.stringify(objects.get(e.sha256).metadata) ===
          JSON.stringify(metadata),
        'conflicting_metadata',
      );
    else objects.set(e.sha256, { evidence: e, metadata });
  }
  check(
    Number.isSafeInteger(concurrency) && concurrency >= 1 && concurrency <= 32,
    'invalid_concurrency',
  );
  const selected = [...objects].slice(0, limit),
    confirmed = new Map();
  let processed = 0,
    next = 0;
  const reservations = new Map(
    (
      await db.prepare('SELECT * FROM wordpress_media_objects').all()
    ).results.map((r) => [r.sha256, r]),
  );
  const existingAssets = new Map(
    (
      await db
        .prepare(
          "SELECT id,asset_json FROM media_uploads WHERE actor='wordpress-migration-v1'",
        )
        .all()
    ).results.map((r) => [r.id, r.asset_json]),
  );
  for (let start = 0; start < selected.length; start += 50) {
    const statements = selected
      .slice(start, start + 50)
      .filter(([sha]) => !reservations.has(sha))
      .map(([sha, { metadata }]) =>
        db
          .prepare(
            "INSERT OR IGNORE INTO wordpress_media_objects(sha256,asset_id,state,metadata_json,created_at) VALUES(?,?,'reserved',?,?)",
          )
          .bind(
            sha,
            `asset_${randomUUID().replaceAll('-', '')}`,
            JSON.stringify(metadata),
            new Date().toISOString(),
          ),
      );
    if (statements.length) await db.batch(statements);
  }
  for (const row of (
    await db.prepare('SELECT * FROM wordpress_media_objects').all()
  ).results)
    reservations.set(row.sha256, row);
  async function worker() {
    while (next < selected.length) {
      const [sha256, { evidence, metadata }] = selected[next++];
      const bytes = await readBytes(evidence);
      check(
        bytes.length === metadata.sizeBytes && hash(bytes) === sha256,
        'local_bytes_changed',
      );
      const json = JSON.stringify(metadata),
        reservation = reservations.get(sha256);
      check(reservation?.metadata_json === json, 'reservation_conflict');
      const key = `originals/${sha256.slice(0, 2)}/${sha256}.${mediaTypes[metadata.mimeType]}`;
      let remote = await bucket.get(key);
      if (!remote) {
        await bucket.put(key, bytes, {
          httpMetadata: { contentType: metadata.mimeType },
          sha256,
          onlyIf: { etagDoesNotMatch: '*' },
        });
        remote = await bucket.get(key);
      }
      check(
        remote &&
          remote.size === bytes.length &&
          hash(Buffer.from(await remote.arrayBuffer())) === sha256,
        'remote_bytes_mismatch',
      );
      const asset = {
        schemaVersion: 1,
        id: reservation.asset_id,
        type: 'asset',
        originalFilename: `${sha256}.${mediaTypes[metadata.mimeType]}`,
        createdAt: reservation.created_at,
        kind: metadata.mimeType === 'application/pdf' ? 'document' : 'image',
        ...(metadata.mimeType === 'application/pdf'
          ? {}
          : { defaultAltText: '', renditions: [] }),
        original: { storageKey: key, ...metadata },
      };
      const request = JSON.stringify({
        filename: asset.originalFilename,
        mimeType: metadata.mimeType,
        sizeBytes: metadata.sizeBytes,
        sha256,
      });
      const existing = existingAssets.get(asset.id);
      check(
        !existing || existing === JSON.stringify(asset),
        'existing_asset_conflict',
      );
      if (!existing || reservation.state !== 'confirmed')
        await db.batch([
          db
            .prepare(
              'INSERT OR IGNORE INTO media_uploads(id,actor,operation_id,request_json,created_at,expires_at,asset_json) VALUES(?,?,?,?,?,0,?)',
            )
            .bind(
              asset.id,
              'wordpress-migration-v1',
              sha256,
              request,
              reservation.created_at,
              JSON.stringify(asset),
            ),
          db
            .prepare(
              "UPDATE wordpress_media_objects SET state='confirmed' WHERE sha256=?",
            )
            .bind(sha256),
        ]);
      confirmed.set(sha256, asset);
      processed++;
      if (processed % 100 === 0)
        console.log(
          JSON.stringify({
            registeredObjects: processed,
            totalObjects: objects.size,
          }),
        );
    }
  }
  const workers = await Promise.allSettled(
    Array.from({ length: concurrency }, () => worker()),
  );
  const failure = workers.find((r) => r.status === 'rejected');
  if (failure) throw failure.reason;
  const storedAssets = new Map(
    (
      await db
        .prepare(
          "SELECT id,asset_json FROM media_uploads WHERE actor='wordpress-migration-v1'",
        )
        .all()
    ).results.map((r) => [r.id, r.asset_json]),
  );
  for (const asset of confirmed.values())
    check(
      storedAssets.get(asset.id) === JSON.stringify(asset),
      'asset_readback_mismatch',
    );
  const oldSources = new Map(
    (
      await db.prepare('SELECT * FROM wordpress_media_sources').all()
    ).results.map((r) => [r.source_url, r]),
  );
  let sources = 0;
  const sourceStatements = [];
  for (const row of report.urls) {
    const e = row.evidence,
      sha256 = e.state === 'approved-exclusion' ? null : e.sha256;
    if (sha256 && !confirmed.has(sha256)) continue;
    // Path/cache details and private article metadata stay in the local verification artifact.
    const evidence = JSON.stringify({
      usage: row.usage,
      originalFailure: row.originalFailure?.state ?? null,
      decision: row.decision ?? null,
      attachmentMatch: row.attachmentMatch,
      attachments: row.attachments,
    });
    const existing = oldSources.get(row.url);
    check(
      !existing ||
        (existing.sha256 === sha256 &&
          existing.disposition === e.state &&
          existing.evidence_json === evidence),
      'source_mapping_conflict',
    );
    if (!existing)
      sourceStatements.push(
        db
          .prepare(
            'INSERT OR IGNORE INTO wordpress_media_sources(source_url,sha256,disposition,evidence_json) VALUES(?,?,?,?)',
          )
          .bind(row.url, sha256, e.state, evidence),
      );
    sources++;
  }
  for (let start = 0; start < sourceStatements.length; start += 50)
    await db.batch(sourceStatements.slice(start, start + 50));
  return {
    schemaVersion: 'wordpress-registered-media/v1',
    inputHash: hash(JSON.stringify(report)),
    complete: processed === objects.size,
    summary: { objects: processed, totalObjects: objects.size, sources },
    assets: [...confirmed.values()].sort((a, b) => a.id.localeCompare(b.id)),
    urls: report.urls
      .filter(
        (r) =>
          r.evidence.state === 'approved-exclusion' ||
          confirmed.has(r.evidence.sha256),
      )
      .map((r) => ({
        url: r.url,
        disposition: r.evidence.state,
        assetId:
          r.evidence.state === 'approved-exclusion'
            ? null
            : confirmed.get(r.evidence.sha256).id,
      })),
  };
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  let proxy;
  try {
    const args = process.argv.slice(2);
    check(
      args.length === 2 ||
        (args.length === 4 &&
          args[2] === '--limit' &&
          /^[1-9]\d*$/.test(args[3])),
      'usage',
    );
    const local = await realpath(
        fileURLToPath(new URL('../../.local', import.meta.url)),
      ),
      input = await realpath(resolve(args[0])),
      output = resolve(args[1]);
    check(
      [input, await realpath(dirname(output))].every(
        (p) => p === local || p.startsWith(local + sep),
      ),
      'local_paths_required',
    );
    // Reserve output before any remote mutation; never rerun into an existing output.
    const { open } = await import('node:fs/promises');
    const outputHandle = await open(output, 'wx', 0o600);
    await outputHandle.close();
    const report = JSON.parse(await readFile(input));
    const { getPlatformProxy } = await import('wrangler');
    proxy = await getPlatformProxy({
      configPath: fileURLToPath(
        new URL('../wrangler.migration-import.jsonc', import.meta.url),
      ),
      envFiles: [],
      persist: false,
      remoteBindings: true,
    });
    const result = await registerMedia({
      report,
      db: proxy.env.DB,
      bucket: proxy.env.MEDIA,
      limit: args[3] ? Number(args[3]) : Infinity,
      readBytes: async (e) => {
        const root = await realpath(e.cache),
          path = join(root, e.localPath);
        check(
          root.startsWith(local + sep) &&
            /^blobs\/[a-f0-9]{64}\.(jpg|png|gif|webp|pdf)$/.test(e.localPath),
          'invalid_cache_path',
        );
        check(
          (await realpath(path)).startsWith(root + sep) &&
            (await lstat(path)).isFile() &&
            !(await lstat(path)).isSymbolicLink(),
          'invalid_cache_file',
        );
        return readFile(path);
      },
    });
    await writeFile(
      output,
      JSON.stringify(
        {
          ...result,
          target: {
            database: 'paf-cms-migration-db',
            bucket: 'paf-cms-migration-media',
          },
        },
        null,
        2,
      ) + '\n',
      { mode: 0o600 },
    );
    console.log(JSON.stringify(result.summary));
  } catch {
    console.error(
      'Media registration failed; reservations are retained for resume.',
    );
    process.exitCode = 1;
  } finally {
    await proxy?.dispose();
  }
}
