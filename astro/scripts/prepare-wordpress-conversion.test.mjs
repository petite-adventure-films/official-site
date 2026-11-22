import test from 'node:test';
import assert from 'node:assert/strict';
import { prepare, convertBody } from './prepare-wordpress-conversion.mjs';
const record = (id = 1) => ({
  id,
  title: '原文',
  content: '<p>本文 <strong>強調</strong><br>次の行 <a href="https://example.com/">リンク</a></p>',
  published: '2026/11/22',
  updated: '2026/11/22',
});
function snapshot(rows) {
  return {
    schemaVersion: 1,
    source: { exportedAt: '2026-11-22' },
    counts: { blogs: 0, news: rows.length, events: 0, media: 0, channels: 0 },
    content: { blogs: [], news: rows, events: [], media: [], channels: [] },
    taxonomies: { blogTags: [] },
  };
}
test('preserves text, formatting, link and line break in a schema-valid candidate', () => {
  const raw = record();
  const result = prepare(snapshot([raw]), 'hash');
  const row = result.rows[0];
  assert.ok(row.candidate);
  assert.deepEqual(row.source.raw, raw);
  assert.equal(row.source.recordHash.length, 64);
  assert.ok(JSON.stringify(row.candidate).includes('bold'));
  assert.ok(JSON.stringify(row.candidate).includes('hardBreak'));
  assert.equal(row.references[0].url, 'https://example.com/');
});
test('preserves link destinations, titles and same-tab/new-tab behavior', () => {
  for (const target of [null, '_self', '_blank']) {
    const result = convertBody(
      `<p><a href="https://example.com/?a=1&amp;b=2" title="説明"${target ? ` target="${target}"` : ''}>リンク</a></p>`,
    );
    assert.deepEqual(result.issues, []);
    assert.deepEqual(result.body.doc.content[0].content[0].marks[0].attrs, {
      href: 'https://example.com/?a=1&b=2',
      target: target ?? '_self',
      title: '説明',
    });
  }
  assert.ok(convertBody('<a href="https://example.com/" target="named">リンク</a>').issues.length);
});
test('never drops images, embeds, styles, anchors, unknown elements or attachment links', () => {
  for (const html of [
    '<img src="https://example.com/a.png">',
    '<iframe src="https://example.com/"></iframe>',
    '<p style="color:red">text</p>',
    '<span id="old">text</span>',
    '<table><tr><td>text</td></tr></table>',
    '<a href="https://www.petiteadventurefilms.com/wp/wp-content/uploads/a.pdf">PDF</a>',
    '<script>alert(1)</script>',
  ]) {
    const row = prepare(snapshot([{ ...record(), content: html }]), 'hash').rows[0];
    assert.equal(row.candidate, null, html);
    assert.ok(row.issues.length, html);
  }
});
test('rejects unsafe/relative/empty links and invalid ordered list starts', () => {
  for (const html of [
    '<a href="javascript:alert(1)">text</a>',
    '<a href="/old/">text</a>',
    '<a href="https://example.com/"></a>',
    '<ol start="abc"><li>x</li></ol>',
  ])
    assert.ok(convertBody(html).issues.length, html);
});
test('unknown fields and invalid dates block a row without preventing the next row', () => {
  const rows = [
    { ...record(1), newField: 'keep me' },
    { ...record(2), published: '2026/13/01' },
    { ...record(3), published: '2026/02/30' },
    record(4),
  ];
  const output = prepare(snapshot(rows), 'hash');
  assert.equal(output.rows.length, 4);
  assert.deepEqual(
    output.rows.map((r) => Boolean(r.candidate)),
    [false, false, false, true],
  );
  assert.equal(output.rows[0].source.raw.newField, 'keep me');
});
test('both owners of a duplicate source ID are blocked', () => {
  const output = prepare(snapshot([record(), record()]), 'hash');
  assert.ok(output.rows.every((r) => r.candidate === null));
  assert.equal(output.summary.byCode.duplicate_id, 2);
});
test('incomplete snapshots fail rather than treating omitted types as empty', () => {
  const a = snapshot([]);
  delete a.content.events;
  assert.throws(() => prepare(a, 'hash'), /count_mismatch/);
  const b = snapshot([record()]);
  b.counts.news = 0;
  assert.throws(() => prepare(b, 'hash'), /count_mismatch/);
  const c = snapshot([]);
  c.content.other = [];
  assert.throws(() => prepare(c, 'hash'), /unknown_content_group/);
});
test('the same source produces identical output and is not mutated', () => {
  const input = snapshot([record()]);
  const before = JSON.stringify(input);
  assert.deepEqual(prepare(input, 'hash'), prepare(input, 'hash'));
  assert.equal(JSON.stringify(input), before);
});

test('blocks overlong titles using the current draft schema', () => {
  const row = prepare(snapshot([{ ...record(), title: 'x'.repeat(201) }]), 'hash').rows[0];
  assert.equal(row.candidate, null);
  assert.ok(row.issues.some((i) => i.code === 'draft_schema'));
});
test('blog slug collisions block both owners and unknown catalog IDs never disappear', () => {
  const input = snapshot([]);
  const blog = {
    id: 10,
    title: '記事',
    name: 'same',
    published: '2026/11/22',
    recommended: '0',
    film_tags: false,
    event_tags: false,
    categories: [{ term_id: 1 }],
    thumbnail: false,
    content: '<p>本文</p>',
    tag_ids: [],
  };
  input.content.blogs = [blog, { ...blog, id: 11, film_tags: [{ term_id: 99999 }] }];
  input.counts.blogs = 2;
  const report = prepare(input, 'hash');
  assert.ok(report.rows.every((row) => row.candidate === null));
  assert.equal(report.summary.byCode.duplicate_path, 2);
  assert.equal(report.summary.byCode.unknown_catalog_id, 1);
  assert.deepEqual(report.rows[1].source.raw.film_tags, [{ term_id: 99999 }]);
});

test('paragraph boundary whitespace is not confused with lost text', () => {
  const result = convertBody('<p>第一段落</p>\n<p>第二段落 <strong>強調</strong></p>');
  assert.deepEqual(result.issues, []);
  assert.equal(result.body.doc.content.length, 2);
});

test('retains external PDF links per the body contract and blocks only own unresolved attachments', () => {
  for (const href of [
    'https://example.com/a.pdf',
    'https://example.com/wp/wp-content/uploads/a.pdf',
  ]) {
    const result = convertBody(`<p><a href="${href}">資料</a></p>`);
    assert.deepEqual(result.issues, []);
    assert.equal(result.body.doc.content[0].content[0].marks[0].attrs.href, href);
  }
  for (const href of [
    'https://www.petiteadventurefilms.com/file.pdf',
    'https://petiteadventurefilms.com/wp/wp-content/uploads/a.jpg',
  ]) {
    assert.ok(
      convertBody(`<a href="${href}">資料</a>`).issues.some(
        (issue) => issue.code === 'unresolved_attachment_link',
      ),
    );
  }
});

test('retains discretionary breaks at their text positions and rejects their unknown attributes', () => {
  const result = convertBody('<p>alpha<wbr>beta<wbr><strong>gamma<wbr>delta</strong><br>end</p>');
  assert.deepEqual(result.issues, []);
  const children = result.body.doc.content[0].content;
  assert.deepEqual(
    children.map((n) => (n.type === 'text' ? n.text : n.type)),
    ['alpha', 'wordBreak', 'beta', 'wordBreak', 'gamma', 'wordBreak', 'delta', 'hardBreak', 'end'],
  );
  assert.ok(convertBody('<p>a<wbr onclick="alert(1)">b</p>').issues.length);
});

test('retains validated YouTube/Vimeo nodes, parameters, dimensions and surrounding text', () => {
  const result = convertBody(
    '<p>前</p><p><iframe src="https://player.vimeo.com/video/50026595?h=abcdef1234" width="640" height="512" frameborder="0" allowfullscreen="allowfullscreen"></iframe></p><p>後</p>',
  );
  assert.deepEqual(result.issues, []);
  const nodes = result.body.doc.content;
  assert.deepEqual(
    nodes.map((n) => n.type),
    ['paragraph', 'externalVideo', 'paragraph'],
  );
  const video = nodes.find((n) => n.type === 'externalVideo');
  assert.deepEqual(video.attrs, {
    provider: 'vimeo',
    videoId: '50026595',
    sourceUrl: 'https://player.vimeo.com/video/50026595?h=abcdef1234',
    width: 640,
    height: 512,
  });
  assert.ok(JSON.stringify(nodes).indexOf('前') < JSON.stringify(nodes).indexOf('externalVideo'));
  assert.ok(JSON.stringify(nodes).indexOf('externalVideo') < JSON.stringify(nodes).indexOf('後'));
});

test('rejects unsafe or unrecognized video embeds without dropping them', () => {
  for (const src of [
    'https://www.youtube.com.evil.example/embed/abcdefghijk',
    'https://www.youtube.com@evil.example/embed/abcdefghijk',
    'https://user:pass@www.youtube.com/embed/abcdefghijk',
    'javascript:alert(1)',
    'http://www.youtube.com/embed/abcdefghijk',
    'https://www.youtube.com:443/embed/abcdefghijk',
    'https://www.youtube.com/embed/short',
    'https://player.vimeo.com/video/not-a-number',
    'https://player.vimeo.com/video/50026595?h=bad%22value',
    'https://www.youtube.com/embed/abcdefghijk?start=1&start=2',
    'https://www.youtube.com/embed/abcdefghijk?autoplay=1',
    'https://www.youtube.com/embed/abcdefghijk#fragment',
  ])
    assert.ok(convertBody(`<iframe src="${src}"></iframe>`).issues.length, src);
  for (const attr of [
    'srcdoc="text"',
    'onload="alert(1)"',
    'width="100%"',
    'frameborder="1"',
    'allow="camera"',
  ])
    assert.ok(
      convertBody(`<iframe src="https://www.youtube.com/embed/abcdefghijk" ${attr}></iframe>`)
        .issues.length,
      attr,
    );
});

test('all 151 embedded videos from the 90 legacy blog articles retain their source attributes', async () => {
  const { readFile } = await import('node:fs/promises');
  const { createRequire } = await import('node:module');
  const { JSDOM } = createRequire(new URL('../package.json', import.meta.url))('jsdom');
  const { videoFromElement } = await import('../../packages/content-schema/external-video.ts');
  const source = JSON.parse(
    await readFile(new URL('../data/wordpress-export.json', import.meta.url), 'utf8'),
  );
  const dom = new JSDOM('');
  let count = 0,
    articles = 0;
  try {
    for (const post of source.content.blogs) {
      const document = new dom.window.DOMParser().parseFromString(post.content, 'text/html');
      const frames = [...document.querySelectorAll('iframe')];
      if (frames.length) articles++;
      for (const frame of frames) {
        const result = convertBody(frame.outerHTML);
        assert.deepEqual(result.issues, [], String(post.id));
        assert.deepEqual(
          result.body.doc.content.find((n) => n.type === 'externalVideo').attrs,
          videoFromElement(frame),
        );
        count++;
      }
    }
    assert.equal(articles, 90);
    assert.equal(count, 151);
  } finally {
    dom.window.close();
  }
});

test('never invents empty paragraphs around videos or silently splits mixed video paragraphs', () => {
  const frame = '<iframe src="https://www.youtube.com/embed/abcdefghijk"></iframe>';
  const result = convertBody(`<p></p><p>${frame}</p><p></p>`);
  assert.deepEqual(result.issues, []);
  assert.deepEqual(
    result.body.doc.content.map((n) => n.type),
    ['paragraph', 'externalVideo', 'paragraph'],
  );
  assert.ok(convertBody(`<p>横の本文${frame}</p>`).issues.length);
});
