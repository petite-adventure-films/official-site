import test from 'node:test';
import assert from 'node:assert/strict';
import { convertBody } from './prepare-wordpress-conversion.mjs';
import { createMediaResolver } from './wordpress-body-media.mjs';
const id = 'asset_' + 'a'.repeat(32),
  sha = 'b'.repeat(64),
  url = 'https://petiteadventurefilms.com/wp/wp-content/uploads/test.png';
function fixture() {
  return {
    schemaVersion: 'wordpress-asset-map/v1',
    target: {
      database: 'paf-cms-migration-db',
      bucket: 'paf-cms-migration-media',
    },
    summary: { assets: 1, urls: 1 },
    assets: [
      {
        schemaVersion: 1,
        id,
        type: 'asset',
        kind: 'image',
        originalFilename: 'test.png',
        createdAt: '2026-11-28T00:00:00.000Z',
        defaultAltText: '',
        renditions: [],
        original: {
          sha256: sha,
          sizeBytes: 10,
          mimeType: 'image/png',
          width: 400,
          height: 300,
          storageKey: `originals/bb/${sha}.png`,
        },
      },
    ],
    entries: [
      {
        sourceUrl: url,
        disposition: 'registered',
        assetId: id,
        kind: 'image',
        sha256: sha,
        deliveryUrl: `https://paf-cms-migration-media.petiteadventurefilms2.workers.dev/media/${id}.png`,
      },
    ],
  };
}
const run = (html) =>
  convertBody(html, 'content', {
    mediaResolver: createMediaResolver(fixture()),
    legacyId: 1,
    preserveLegacyContainers: true,
    archiveLegacyAttributes: true,
  });
test('retains inline image position, dimensions, title, srcset and image-link target', () => {
  const r = run(
    `<p>前<a href="${url}" target="_blank" title="拡大"><img src="${url}" alt="説明" title="写真" width="200" height="150" class="alignnone wp-image-1 size-full" loading="lazy" decoding="async" srcset="${url} 400w" sizes="auto, (max-width: 400px) 100vw, 400px"></a>後</p>`,
  );
  assert.deepEqual(r.issues, []);
  const image = r.body.doc.content[0].content[1];
  assert.equal(image.type, 'inlineAssetImage');
  assert.deepEqual(image.attrs, {
    assetId: id,
    alt: '説明',
    title: '写真',
    width: 200,
    height: 150,
    legacyClass: 'alignnone wp-image-1 size-full',
    loading: 'lazy',
    decoding: 'async',
    sources: [{ assetId: id, width: 400 }],
    sizes: 'auto, (max-width: 400px) 100vw, 400px',
  });
  assert.deepEqual(image.marks, [
    {
      type: 'assetLink',
      attrs: {
        assetId: id,
        assetKind: 'image',
        target: '_blank',
        title: '拡大',
      },
    },
  ]);
});
test('retains standalone image and external image click-through without invented paragraphs', () => {
  const block = run(`<img src="${url}" alt="">`);
  assert.deepEqual(block.issues, []);
  assert.equal(block.body.doc.content[0].type, 'assetImage');
  const r = run(
    `<p><a href="https://example.org/" title="関連"><img src="${url}" alt="関連画像"></a></p>`,
  );
  assert.deepEqual(r.issues, []);
  assert.equal(r.body.doc.content[0].content[0].marks[0].type, 'link');
});
test('unknown assets, source markers, arbitrary classes, invalid dimensions and unsafe targets stop', () => {
  for (const html of [
    `<img src="${url}" onerror="alert(1)">`,
    `<img src="${url}" class="hidden">`,
    `<img src="${url}" width="0">`,
    `<img src="${url}" data-paf-asset="{}">`,
    `<img src="${url}unknown">`,
    `<p><a href="${url}" target="named"><img src="${url}"></a></p>`,
  ])
    assert.ok(run(html).issues.length);
});
test('map rejects mismatched assets, wrong target and unapproved exclusions', () => {
  for (const mutate of [
    (m) => (m.target.database = 'other'),
    (m) => (m.entries[0].sha256 = 'f'.repeat(64)),
    (m) => (m.entries[0].assetId = 'asset_' + 'c'.repeat(32)),
    (m) => (m.entries[0].disposition = 'excluded'),
  ]) {
    const m = fixture();
    mutate(m);
    assert.throws(() => createMediaResolver(m));
  }
});
test('raw inline text and formatted images keep their surrounding positions', () => {
  for (const html of [
    `前<img src="${url}" alt="">後<img src="${url}" alt="">末尾`,
    `<p><strong>前<img src="${url}" alt="">後</strong></p>`,
  ])
    assert.deepEqual(run(html).issues, []);
});
test('approved recovery and exclusion are limited to the exact source and approved article', async () => {
  const { readFile } = await import('node:fs/promises');
  const decisions = JSON.parse(
    await readFile(
      new URL(
        '../../specs/011-wordpress-conversion/media-recovery-decisions.json',
        import.meta.url,
      ),
    ),
  ).decisions;
  const d = decisions.find((d) => d.decision === 'recover-original');
  const m = fixture();
  m.assets[0].original.sha256 = d.sha256;
  m.assets[0].original.storageKey = `originals/${d.sha256.slice(0, 2)}/${d.sha256}.png`;
  m.entries[0] = {
    ...m.entries[0],
    sourceUrl: d.sourceUrl,
    disposition: 'recovered',
    decision: d,
    sha256: d.sha256,
  };
  const resolver = createMediaResolver(m);
  const r = convertBody(
    `<p><img src="${d.sourceUrl}" alt="復旧" width="200" height="200"></p>`,
    'content',
    { mediaResolver: resolver, legacyId: d.articleIds[0] },
  );
  assert.deepEqual(r.issues, []);
  assert.equal(r.body.doc.content[0].content[0].attrs.height, 150);
  assert.ok(
    convertBody(`<img src="${d.sourceUrl}">`, 'content', {
      mediaResolver: resolver,
      legacyId: 1,
    }).issues.length,
  );
  const ex = decisions.find((d) => d.decision === 'exclude');
  m.entries.push({
    sourceUrl: ex.sourceUrl,
    disposition: 'excluded',
    decision: ex,
    assetId: null,
    deliveryUrl: null,
  });
  m.summary.urls++;
  const removed = convertBody(
    `<p>前<img src="${ex.sourceUrl}" alt="除外">後</p>`,
    'content',
    { mediaResolver: createMediaResolver(m), legacyId: ex.articleIds[0] },
  );
  assert.deepEqual(removed.issues, []);
  assert.equal(removed.body.doc.content[0].content[0].text, '前後');
  assert.ok(
    removed.transformations.some(
      (t) => t.reason === 'approved-image-exclusion' && t.from.includes('除外'),
    ),
  );
});
test('transparent mail spacer exclusion is exact and cannot remove changed article content',()=>{
 const html='<p>前<img class="ajT" src="https://ssl.gstatic.com/ui/v1/icons/mail/images/cleardot.gif">後</p>';
 const options={mediaResolver:createMediaResolver(fixture()),legacyId:4772};assert.ok(convertBody(html+html,'content',options).issues.length);const r=convertBody(html,'content',options);assert.deepEqual(r.issues,[]);assert.equal(r.body.doc.content[0].content[0].text,'前後');assert.ok(r.transformations.some(t=>t.reason==='approved-transparent-image-exclusion'));
 assert.ok(convertBody(html,'content',{...options,legacyId:1}).issues.length);assert.ok(convertBody(html.replace('class="ajT"','class="ajT" alt="意味のある説明"'),'content',options).issues.length);
});
