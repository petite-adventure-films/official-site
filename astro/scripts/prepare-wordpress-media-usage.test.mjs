import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareMediaUsage } from './prepare-wordpress-media-usage.mjs';
import { parseAttachmentMetadata } from './wordpress-attachment-metadata.mjs';
import { makeUsagePlan } from './acquire-wordpress-media-usage.mjs';
const base = 'https://www.petiteadventurefilms.com/wp/wp-content/uploads/';
function serialize(value) {
  if (typeof value === 'string')
    return `s:${Buffer.byteLength(value)}:"${value}";`;
  if (typeof value === 'number') return `i:${value};`;
  return `a:${Object.keys(value).length}:{${Object.entries(value)
    .map(([k, v]) => serialize(k) + serialize(v))
    .join('')}}`;
}
function fixture() {
  const snapshot = {
    schemaVersion: 1,
    content: {
      blogs: [{ id: 1, content: `<img src="${base}2020/shared.jpg">` }],
      news: [],
      events: [],
      media: [],
      channels: [],
    },
    counts: { blogs: 1, news: 0, events: 0, media: 0, channels: 0 },
  };
  const intake = {
    schemaVersion: 'wordpress-nonpublic-intake/v1',
    counts: { draft: 1, private: 0 },
    posts: [
      {
        legacyId: 2,
        sourceStatus: 'draft',
        publish: false,
        restRecord: {
          id: 2,
          status: 'draft',
          content: {
            raw: `<img src="${base}2020/shared.jpg"><img src="${base}2020/private-300x200.jpg?x=1&amp;y=2#z">`,
            rendered: `<img src="${base}2020/private-300x200.jpg">`,
          },
        },
      },
    ],
    attachments: [
      {
        legacyId: 3,
        parentId: 2,
        url: base + '2020/private.jpg',
        meta: {
          _wp_attached_file: ['2020/private.jpg'],
          _wp_attachment_metadata: [
            serialize({
              file: '2020/private.jpg',
              sizes: {
                medium: {
                  file: 'private-300x200.jpg',
                  width: 300,
                  height: 200,
                },
              },
            }),
          ],
        },
      },
      { legacyId: 4, parentId: 2, url: base + '2020/unused.jpg', meta: {} },
    ],
  };
  const transfer = {
    schemaVersion: 'wordpress-media-transfer-preflight/v1',
    urls: [],
    objects: [],
  };
  return { snapshot, intake, transfer };
}
const run = (f) =>
  prepareMediaUsage(
    ...[f.snapshot, f.intake, f.transfer].map((v) =>
      Buffer.from(JSON.stringify(v)),
    ),
  );
test('byte-aware PHP parser supports Japanese, rejects objects, references, malformed data and duplicate keys', () => {
  assert.equal(
    parseAttachmentMetadata(serialize({ file: '日本.jpg' })).file,
    '日本.jpg',
  );
  for (const value of [
    'O:8:"stdClass":0:{}',
    'R:1;',
    's:1:"日本";',
    'a:2:{s:1:"a";i:1;s:1:"a";i:2;}',
    'a:999999999:{}',
    'i:1;extra',
  ])
    assert.throws(() => parseAttachmentMetadata(value));
});
test('joins exact WXR sizes, distinguishes shared usage and never equates attachment parent with use', () => {
  const f = fixture(),
    r = run(f);
  assert.deepEqual(r.summary.usage, { 'nonpublic-only': 1, shared: 1 });
  const privateUrl = r.urls.find((u) => u.usage === 'nonpublic-only');
  assert.equal(privateUrl.attachmentMatch, 'matched');
  assert.equal(privateUrl.attachments[0].kind, 'declared-size');
  assert.equal(
    r.attachments.find((a) => a.legacyId === 4).usage,
    'not-proven-referenced',
  );
  assert.equal(
    r.articles[1].occurrences[1].rawUrl.endsWith('?x=1&amp;y=2#z'),
    true,
  );
  for (const o of r.articles[1].occurrences)
    assert.equal(
      f.intake.posts[0].restRecord.content[o.field].slice(o.start, o.end),
      o.rawUrl,
    );
  assert.deepEqual(r, run(f));
});
test('does not infer HTTP aliases; malformed metadata, relative references and shortcodes remain unresolved', () => {
  const f = fixture();
  f.intake.posts[0].restRecord.content.raw = `<img src="${base.replace('https:', 'http:')}2020/private-300x200.jpg"><img src="/wp/wp-content/uploads/2020/missing.jpg">[gallery ids="3"]`;
  const r = run(f);
  assert.equal(
    r.urls.find((u) => u.url.startsWith('http:')).attachmentMatch,
    'not-in-wxr',
  );
  assert.equal(r.summary.unparsed, 2);
  assert.throws(
    () => makeUsagePlan(Buffer.from(JSON.stringify(r))),
    /not_ready/,
  );
  f.intake.attachments[0].meta._wp_attachment_metadata = ['O:1:"x":0:{}'];
  assert.equal(run(f).attachments[0].metadataState, 'needs-reconciliation');
});
test('acquisition plans contain only new referenced URLs and preserve source status without inventing asset IDs', () => {
  const f = fixture();
  f.transfer.urls = [
    {
      url: base + '2020/shared.jpg',
      state: 'planned',
      storageKey: 'originals/verified',
    },
  ];
  f.transfer.objects = [
    {
      state: 'planned',
      original: {
        storageKey: 'originals/verified',
        sha256: 'a'.repeat(64),
        sizeBytes: 3,
      },
      localPath: 'blobs/example',
    },
  ];
  const r = run(f),
    plan = makeUsagePlan(Buffer.from(JSON.stringify(r)));
  assert.equal(plan.jobs.length, 1);
  assert.equal(plan.jobs[0].sources[0].role, 'referenced');
  assert.equal(plan.jobs[0].sources[0].references[0].sourceStatus, 'draft');
  assert.ok(!JSON.stringify(plan).includes('assetId'));
  f.intake.posts[0].publish = true;
  assert.throws(() => run(f), /status/);
});
