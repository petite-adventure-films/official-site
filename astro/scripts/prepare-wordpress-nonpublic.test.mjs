import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareCombined } from './prepare-wordpress-nonpublic.mjs';
function fixture() {
  const snapshot = { schemaVersion: 1, source: {}, counts: { blogs: 0, news: 0, events: 0, media: 0, channels: 0 }, content: { blogs: [], news: [], events: [], media: [], channels: [] }, taxonomies: { categories: [{ term_id: 1, slug: 'sample', name: 'Sample' }], blogTags: [], filmTags: [], eventTags: [] } };
  const post = { legacyId: 123, sourceStatus: 'draft', publish: false, meta: {}, wxrTerms: [{ domain: 'category', nicename: 'sample', name: 'Sample' }], restRecord: { id: 123, type: 'post', status: 'draft', title: { raw: 'Synthetic' }, content: { raw: 'original', rendered: '<p>original</p>' }, slug: '', date: '2026-11-27T10:00:00', modified: '2026-11-27T11:00:00', link: 'https://example.test/?p=123', featured_media: 0, categories: [1], tags: [], filmtags: [], eventtags: [] } };
  const intake = { schemaVersion: 'wordpress-nonpublic-intake/v1', counts: { draft: 1, private: 0 }, sourceHashes: {}, posts: [post], attachments: [{ legacyId: 456 }] };
  return { snapshot, intake, post };
}
test('preserves provenance and attachments; empty draft slug has no invented URL and remains unpublished', () => {
  const { snapshot, intake, post } = fixture();
  const report = prepareCombined(snapshot, intake);
  const row = report.rows[0];
  assert.ok(row.candidate);
  assert.equal(row.candidate.slug, undefined);
  assert.equal(row.source.path, null);
  assert.equal(row.publish, false);
  assert.equal(row.source.status, 'draft');
  assert.deepEqual(row.source.raw, post);
  assert.deepEqual(report.attachments, intake.attachments);
  assert.equal(row.source.recordHash.length, 64);
  assert.deepEqual(report, prepareCombined(snapshot, intake));
  assert.equal(snapshot.content.blogs.length, 0);
});
test('private empty slug remains blocked; no accidental public status is accepted', () => {
  const { snapshot, intake, post } = fixture();
  post.sourceStatus = post.restRecord.status = 'private';
  intake.counts = { draft: 0, private: 1 };
  assert.ok(prepareCombined(snapshot, intake).rows[0].issues.some(i => i.code === 'invalid_slug'));
  post.restRecord.status = 'publish';
  assert.throws(() => prepareCombined(snapshot, intake), /invalid_nonpublic_status/);
});
test('blocks both sides of public/private path and ID collisions', () => {
  for (const sameId of [false, true]) {
    const { snapshot, intake, post } = fixture();
    post.restRecord.slug = 'same';
    snapshot.content.blogs.push({ id: sameId ? 123 : 321, title: 'Public', name: sameId ? 'other' : 'same', published: '2026/11/27', recommended: '', film_tags: [], event_tags: [], categories: [{ term_id: 1 }], thumbnail: false, content: '<p>Public</p>', tag_ids: [] });
    snapshot.counts.blogs = 1;
    const report = prepareCombined(snapshot, intake);
    assert.deepEqual(report.rows.map(r => r.source.status), ['publish', 'draft']);
    for (const row of report.rows) {
      assert.equal(row.candidate, null);
      assert.ok(row.issues.some(i => i.code === (sameId ? 'duplicate_id' : 'duplicate_path')));
    }
  }
});
test('taxonomy mismatch, unknown metadata and unresolved assets cannot become candidates', () => {
  for (const mutate of [p => p.restRecord.meta = { footnotes: 'unmapped note' }, p => p.restRecord.acf = { unknown: 'value' }, p => p.restRecord.categories.push(2), p => p.wxrTerms[0].nicename = 'unknown', p => p.meta.new_field = ['value'], p => p.meta.recommend = ['0','1'], p => p.restRecord.featured_media = 456, p => p.restRecord.content.rendered = '<p><img src="https://example.test/a.jpg"></p>']) {
    const { snapshot, intake, post } = fixture(); mutate(post);
    const row = prepareCombined(snapshot, intake).rows[0];
    assert.equal(row.candidate, null); assert.ok(row.issues.length);
    assert.deepEqual(row.source.raw, post);
  }
});
test('rejects incomplete counts and duplicate intake IDs', () => {
  const { snapshot, intake, post } = fixture();
  intake.counts.draft = 2;
  assert.throws(() => prepareCombined(snapshot, intake), /count_mismatch/);
  intake.posts.push(post);
  assert.throws(() => prepareCombined(snapshot, intake), /duplicate_intake_id/);
});

test('private CLI rejects unsafe destinations, existing outputs and malformed input without source disclosure', async () => {
  const { mkdtemp, writeFile, readFile, rm, mkdir, symlink } = await import('node:fs/promises');
  const { execFileSync } = await import('node:child_process');
  const { fileURLToPath } = await import('node:url');
  const { resolve } = await import('node:path');
  const local = fileURLToPath(new URL('../../.local/', import.meta.url));
  await mkdir(local, { recursive: true });
  const dir = await mkdtemp(resolve(local, 'nonpublic-test-'));
  const script = fileURLToPath(new URL('./prepare-wordpress-nonpublic.mjs', import.meta.url));
  const { snapshot, intake } = fixture();
  try {
    await writeFile(`${dir}/public.json`, JSON.stringify(snapshot));
    await writeFile(`${dir}/intake.json`, JSON.stringify(intake));
    await writeFile(`${dir}/existing.json`, 'keep');
    await symlink('/tmp', `${dir}/outside`);
    const run = output => execFileSync(process.execPath, [script, `${dir}/public.json`, `${dir}/intake.json`, output], { stdio: 'pipe' });
    for (const output of [`${dir}/existing.json`, `${dir}/outside/private.json`]) assert.throws(() => run(output));
    assert.equal(await readFile(`${dir}/existing.json`, 'utf8'), 'keep');
    await writeFile(`${dir}/intake.json`, 'PRIVATE-SENTINEL invalid JSON');
    try { run(`${dir}/result.json`); assert.fail('must fail'); }
    catch (error) { assert.ok(!String(error.stderr).includes('PRIVATE-SENTINEL')); }
  } finally { await rm(dir, { recursive: true, force: true }); }
});
