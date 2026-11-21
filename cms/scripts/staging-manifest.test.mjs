import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { validateStagingManifest } from './staging-manifest.mjs';
function eventManifest() {
  const payload = { type: 'event', payloadSchemaVersion: 'event-publication/v1', slug: 'review-event', title: 'Fixed candidate' };
  return { delivery: { operationId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', contentId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', attempt: 1, payload,
    hash: createHash('sha256').update(JSON.stringify(payload)).digest('hex'), routes: { canonicalPath: '/events/review-event/' } },
    snapshot: { schemaVersion: 'cms-events/v1', events: [{ id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', payload: structuredClone(payload) }] }, blogs: [], articles: [], assets: [], redirects: [] };
}
test('accepts the event candidate only when its content, identity and canonical path match', () => {
  assert.doesNotThrow(() => validateStagingManifest(eventManifest()));
  for (const mutate of [m => m.snapshot.events.splice(0), m => m.snapshot.events[0].payload.title = 'Other', m => m.snapshot.events[0].id = 'other', m => m.delivery.routes.canonicalPath = '/events/other/', m => m.delivery.hash = '0'.repeat(64)]) {
    const manifest = eventManifest(); mutate(manifest); assert.throws(() => validateStagingManifest(manifest));
  }
});
test('rejects unsafe redirects', () => {
  const manifest = eventManifest(); manifest.redirects.push({ from: '//other.example/', to: '/events/review-event/' });
  assert.throws(() => validateStagingManifest(manifest));
});

test('continues to accept blog and news candidates and rejects missing routes', () => {
  for (const [type, path] of [['blog', '/blog-review/'], ['news', '/news/#cms-bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb']]) {
    const m = eventManifest(); m.delivery.payload = { type, content: { title: 'Article' } };
    m.delivery.hash = createHash('sha256').update(JSON.stringify(m.delivery.payload)).digest('hex');
    m.delivery.routes.canonicalPath = path;
    const entries = type === 'blog' ? m.blogs : m.articles; entries.push({ path });
    assert.doesNotThrow(() => validateStagingManifest(m));
    entries.pop(); assert.throws(() => validateStagingManifest(m));
  }
});
