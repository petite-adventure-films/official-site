import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { prepareReferences } from './prepare-wordpress-media-references.mjs';
const url = 'https://petiteadventurefilms.com/wp/wp-content/uploads/a.jpg';
function fixture() {
  const snapshot = {
    content: {
      blogs: [
        { id: 1, content: `<p>🌱<img src="${url}?x=1&amp;y=2#part"><a href="${url}">画像</a></p>` },
      ],
      news: [{ id: 2, content: '' }],
    },
  };
  const bytes = JSON.stringify(snapshot);
  const manifest = {
    schemaVersion: 'wordpress-media-transfer-preflight/v1',
    snapshotHash: createHash('sha256').update(bytes).digest('hex'),
    objects: [{ original: { storageKey: 'originals/aa/a.jpg' }, state: 'planned' }],
    urls: [
      {
        url,
        state: 'planned',
        storageKey: 'originals/aa/a.jpg',
        sources: [
          { role: 'referenced', references: [{ type: 'blog', legacyId: 1, fields: ['content'] }] },
        ],
      },
    ],
  };
  return { snapshot, bytes, manifest };
}
const run = (f) => prepareReferences(f.bytes, JSON.stringify(f.manifest));
test('preserves raw suffix/entities, repeated occurrences and exact UTF-16 slices without rewriting', () => {
  const f = fixture(),
    before = JSON.stringify(f);
  const result = run(f);
  assert.equal(result.summary.articles, 2);
  assert.equal(result.summary.references, 2);
  assert.equal(result.summary.states.planned, 2);
  for (const ref of result.articles[0].references) {
    assert.equal(f.snapshot.content.blogs[0].content.slice(ref.start, ref.end), ref.rawUrl);
    assert.equal(ref.normalizedUrl, url);
  }
  assert.ok(result.articles[0].references[0].rawUrl.endsWith('?x=1&amp;y=2#part'));
  assert.deepEqual(run(f), result);
  assert.equal(JSON.stringify(f), before);
  assert.ok(!JSON.stringify(result).includes('"assetId"'));
});
test('never substitutes missing, candidate, blocked or unowned references', () => {
  for (const state of ['missing', 'candidate-only', 'blocked-upload-limit']) {
    const f = fixture();
    f.manifest.urls[0].state = state;
    const refs = run(f).articles[0].references;
    for (const ref of refs) assert.equal(ref.storageKey, undefined);
  }
  const f = fixture();
  f.manifest.urls[0].sources[0].references[0].legacyId = 3;
  assert.equal(run(f).articles[0].references[0].state, 'unmatched-source');
});
test('reports unknown absolute URLs and relative paths even when a known absolute URL is present', () => {
  const f = fixture();
  f.snapshot.content.blogs[0].content +=
    '<img src="/wp/wp-content/uploads/b.jpg"> https://other.example/wp/wp-content/uploads/a.jpg';
  f.bytes = JSON.stringify(f.snapshot);
  f.manifest.snapshotHash = createHash('sha256').update(f.bytes).digest('hex');
  const result = run(f);
  assert.equal(result.summary.unparsed, 1);
  assert.equal(result.summary.states.unmapped, 1);
});
test('refuses wrong snapshot, duplicate mappings and planned URLs without planned objects', () => {
  const f = fixture();
  f.manifest.snapshotHash = 'wrong';
  assert.throws(() => run(f), /transfer_snapshot_mismatch/);
  const g = fixture();
  g.manifest.urls.push(g.manifest.urls[0]);
  assert.throws(() => run(g), /duplicate_url/);
  const h = fixture();
  h.manifest.objects = [];
  assert.throws(() => run(h), /missing_planned_object/);
});
