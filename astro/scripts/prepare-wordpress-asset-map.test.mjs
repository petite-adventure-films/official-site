import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { prepareAssetMap } from './prepare-wordpress-asset-map.mjs';
const encode = (v) => Buffer.from(JSON.stringify(v));
function fixture() {
  const sha = 'b'.repeat(64),
    id = 'asset_' + 'a'.repeat(32);
  const asset = {
    schemaVersion: 1,
    id,
    type: 'asset',
    kind: 'image',
    originalFilename: 'synthetic.png',
    createdAt: '2026-11-28T00:00:00.000Z',
    defaultAltText: '',
    renditions: [],
    original: {
      sha256: sha,
      sizeBytes: 10,
      mimeType: 'image/png',
      width: 1,
      height: 1,
      storageKey: `originals/bb/${sha}.png`,
    },
  };
  const verified = {
    schemaVersion: 'wordpress-media-usage-verification/v1',
    urls: [
      {
        url: 'https://example.test/a.png',
        usage: 'nonpublic-only',
        evidence: {
          state: 'verified-local',
          sha256: sha,
          sizeBytes: 10,
          mime: 'image/png',
          width: 1,
          height: 1,
        },
      },
    ],
  };
  const registered = {
    schemaVersion: 'wordpress-registered-media/v1',
    complete: true,
    inputHash: createHash('sha256')
      .update(JSON.stringify(verified))
      .digest('hex'),
    target: {
      database: 'paf-cms-migration-db',
      bucket: 'paf-cms-migration-media',
    },
    assets: [asset],
    urls: [
      { url: verified.urls[0].url, assetId: id, disposition: 'verified-local' },
    ],
    summary: { objects: 1, totalObjects: 1, sources: 1 },
  };
  return { registered, verified };
}
test('hands off only verified asset/v1 IDs and dedicated delivery URLs, with stable output', () => {
  const f = fixture(),
    result = prepareAssetMap(encode(f.registered), encode(f.verified));
  assert.equal(result.summary.assets, 1);
  assert.ok(
    result.entries[0].deliveryUrl.endsWith(f.registered.assets[0].id + '.png'),
  );
  assert.deepEqual(
    result,
    prepareAssetMap(encode(f.registered), encode(f.verified)),
  );
});
test('rejects incomplete registration, different environments, missing URLs and wrong asset metadata', () => {
  for (const mutate of [
    (f) => (f.registered.complete = false),
    (f) => (f.registered.target.database = 'production'),
    (f) => (f.registered.urls = []),
    (f) => (f.registered.assets[0].original.width = 2),
    (f) => (f.registered.assets[0].id = 'fake'),
    (f) => f.registered.assets.push(f.registered.assets[0]),
  ]) {
    const f = fixture();
    mutate(f);
    assert.throws(() =>
      prepareAssetMap(encode(f.registered), encode(f.verified)),
    );
  }
});
