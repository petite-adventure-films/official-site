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
test('never drops images, embeds, styles, anchors, unknown elements or attachment links', () => {
  for (const html of [
    '<img src="https://example.com/a.png">',
    '<iframe src="https://example.com/"></iframe>',
    '<p style="color:red">text</p>',
    '<span id="old">text</span>',
    '<table><tr><td>text</td></tr></table>',
    '<a href="https://example.com/a.pdf">PDF</a>',
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
