import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from './audit-wordpress-conversion.mjs';

test('groups exact attribute values and retains all article identities and repeat counts', () => {
  const record = (id, content) => ({ id, title: '原文', content,
    published: '2026/11/25', updated: '2026/11/25' });
  const bytes = JSON.stringify({ schemaVersion: 1, source: { exportedAt: '2026-11-25' },
    counts: { blogs: 0, news: 2, events: 0, media: 0, channels: 0 },
    content: { blogs: [], news: [
      record(1, '<span style="color:red">赤</span><span style="color:red">赤2</span>'),
      record(2, '<span style="color:red">赤3</span><span style="color:blue">青</span>'),
    ], events: [], media: [], channels: [] }, taxonomies: { blogTags: [] } });
  const result = audit(bytes);
  const red = result.formats.find((f) => f.attributes.style === 'color:red');
  assert.equal(red.occurrences, 3);
  assert.deepEqual(red.articles, ['news:1', 'news:2']);
  assert.equal(red.example.recordHash.length, 64);
  assert.equal(result.formats.find((f) => f.attributes.style === 'color:blue').occurrences, 1);
  assert.equal(result.summary.byType.news.blocked, 2);
  assert.deepEqual(audit(bytes), result);
});
