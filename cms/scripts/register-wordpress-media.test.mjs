import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { registerMedia } from './register-wordpress-media.mjs';
const digest = (b) => createHash('sha256').update(b).digest('hex');
function fixture() {
  const sql = new DatabaseSync(':memory:');
  for (const name of [
    '0009_media_uploads.sql',
    '0014_wordpress_media_registration.sql',
  ])
    sql.exec(
      readFileSync(new URL('../migrations/' + name, import.meta.url), 'utf8'),
    );
  const statementRun = (query, args) => sql.prepare(query).run(...args);
  const db = {
    prepare(query) {
      const api = (args) => ({
        async run() {
          return statementRun(query, args);
        },
        async first() {
          return sql.prepare(query).get(...args) ?? null;
        },
        async all() {
          return { results: sql.prepare(query).all(...args) };
        },
        bind(...bound) {
          return api(bound);
        },
      });
      return api([]);
    },
    async batch(statements) {
      sql.exec('BEGIN');
      try {
        const result = [];
        for (const statement of statements) result.push(await statement.run());
        sql.exec('COMMIT');
        return result;
      } catch (e) {
        sql.exec('ROLLBACK');
        throw e;
      }
    },
  };
  const stored = new Map();
  let puts = 0;
  const bucket = {
    async get(key) {
      const b = stored.get(key);
      return b
        ? {
            size: b.length,
            async arrayBuffer() {
              return Uint8Array.from(b).buffer;
            },
          }
        : null;
    },
    async put(key, b, options) {
      assert.equal(digest(b), options.sha256);
      assert.equal(options.onlyIf.etagDoesNotMatch, '*');
      stored.set(key, Buffer.from(b));
      puts++;
    },
  };
  const blob = Buffer.from('synthetic bytes'),
    sha256 = digest(blob);
  const report = {
    schemaVersion: 'wordpress-media-usage-verification/v1',
    urls: [
      {
        url: 'https://example.test/a.png',
        usage: 'nonpublic-only',
        attachmentMatch: 'matched',
        attachments: [],
        evidence: {
          state: 'verified-local',
          sha256,
          sizeBytes: blob.length,
          mime: 'image/png',
          width: 1,
          height: 1,
        },
      },
      {
        url: 'https://example.test/alias.png',
        usage: 'public-only',
        attachmentMatch: 'not-in-wxr',
        attachments: [],
        evidence: {
          state: 'verified-local',
          sha256,
          sizeBytes: blob.length,
          mime: 'image/png',
          width: 1,
          height: 1,
        },
      },
    ],
  };
  return {
    sql,
    db,
    bucket,
    stored,
    blob,
    report,
    puts: () => puts,
    args: { report, db, bucket, readBytes: async () => blob, concurrency: 1 },
  };
}
test('registers verified bytes once, maps aliases to one real asset and preserves IDs on replay', async () => {
  const f = fixture();
  try {
    const a = await registerMedia(f.args),
      b = await registerMedia(f.args);
    assert.deepEqual(a, b);
    assert.equal(a.complete, true);
    assert.equal(a.assets.length, 1);
    assert.equal(f.puts(), 1);
    assert.equal(a.urls[0].assetId, a.urls[1].assetId);
    assert.equal(
      f.sql.prepare('SELECT count(*) AS n FROM media_uploads').get().n,
      1,
    );
    assert.equal(
      f.sql.prepare('SELECT count(*) AS n FROM wordpress_media_sources').get()
        .n,
      2,
    );
  } finally {
    f.sql.close();
  }
});
test('interrupted or corrupted remote bytes never confirm an asset; retry retains reserved ID', async () => {
  const f = fixture();
  try {
    const original = f.bucket.put;
    f.bucket.put = async () => {
      throw Error('interrupted');
    };
    await assert.rejects(registerMedia(f.args), /interrupted/);
    const id = f.sql
      .prepare('SELECT asset_id FROM wordpress_media_objects')
      .get().asset_id;
    assert.equal(
      f.sql.prepare('SELECT count(*) AS n FROM media_uploads').get().n,
      0,
    );
    f.bucket.put = original;
    const result = await registerMedia(f.args);
    assert.equal(result.assets[0].id, id);
    const key = result.assets[0].original.storageKey;
    f.stored.set(key, Buffer.from('wrong bytes'));
    await assert.rejects(registerMedia(f.args), /remote_bytes_mismatch/);
    assert.equal(f.puts(), 1);
  } finally {
    f.sql.close();
  }
});
test('rejects changed local bytes and existing source conflicts, records exclusions without an asset', async () => {
  const f = fixture();
  try {
    await assert.rejects(
      registerMedia({
        ...f.args,
        readBytes: async () => Buffer.from('changed'),
      }),
      /local_bytes/,
    );
    assert.equal(
      f.sql
        .prepare(
          "SELECT count(*) AS n FROM wordpress_media_objects WHERE state='confirmed'",
        )
        .get().n,
      0,
    );
    f.report.urls.push({
      url: 'https://example.test/removed.png',
      usage: 'public-only',
      attachmentMatch: 'not-in-wxr',
      attachments: [],
      evidence: { state: 'approved-exclusion' },
    });
    const result = await registerMedia(f.args);
    assert.equal(result.urls[2].assetId, null);
    f.report.urls[0].usage = 'shared';
    await assert.rejects(registerMedia(f.args), /source_mapping_conflict/);
    assert.throws(
      () => f.sql.exec("UPDATE wordpress_media_objects SET asset_id='bad'"),
      /immutable/,
    );
  } finally {
    f.sql.close();
  }
});
