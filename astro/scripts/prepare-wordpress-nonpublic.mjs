// Local-only adapter: audited REST/WXR -> existing conversion and shared collision checks.
import { createHash } from 'node:crypto';
import { readFile, realpath, writeFile } from 'node:fs/promises';
import { resolve, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepare } from './prepare-wordpress-conversion.mjs';
const hash = value => createHash('sha256').update(value).digest('hex');
const requireValue = (condition, code) => { if (!condition) throw Error(code); };
const canonicalSlug = value => decodeURIComponent(value);

export function prepareCombined(snapshot, intake, sourceHashes = {}) {
  requireValue(intake?.schemaVersion === 'wordpress-nonpublic-intake/v1' && Array.isArray(intake.posts) && Array.isArray(intake.attachments), 'invalid_intake');
  const combined = structuredClone(snapshot), origins = new Map(), emptyDraftSlugIds = new Set();
  const counts = { draft: 0, private: 0 };
  for (const post of intake.posts) {
    const r = post.restRecord;
    requireValue(Number.isSafeInteger(post.legacyId) && post.legacyId > 0 && !origins.has(post.legacyId), 'invalid_or_duplicate_intake_id');
    requireValue(r?.id === post.legacyId && r.type === 'post' && ['draft', 'private'].includes(r.status) && r.status === post.sourceStatus && post.publish === false, 'invalid_nonpublic_status');
    requireValue(typeof r.title?.raw === 'string' && typeof r.content?.raw === 'string' && typeof r.content?.rendered === 'string' && typeof r.slug === 'string', 'missing_source_text');
    requireValue(typeof r.date === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(r.date) && typeof r.modified === 'string', 'invalid_source_dates');
    requireValue(Array.isArray(post.wxrTerms) && post.meta && typeof post.meta === 'object', 'missing_wxr_fields');
    const adapterIssues = [];
    const issue = (code, field) => adapterIssues.push({ code, field, detail: 'requires source reconciliation' });
    if (r.acf && Object.keys(r.acf).length) issue('unmapped_nonpublic_acf', 'acf');
    if (r.meta && Object.entries(r.meta).some(([key, value]) => !(key === 'footnotes' && value === '') && !(key === '_acf_changed' && typeof value === 'boolean'))) issue('unmapped_nonpublic_rest_meta', 'meta');
    const mapping = { category: ['categories', 'categories'], post_tag: ['blogTags', 'tags'], filmtags: ['filmTags', 'filmtags'], eventtags: ['eventTags', 'eventtags'] };
    for (const term of post.wxrTerms) if (!mapping[term.domain]) issue('unknown_wxr_taxonomy', 'wxrTerms');
    const terms = {};
    for (const [domain, [catalog, restKey]] of Object.entries(mapping)) {
      const resolved = [];
      for (const term of post.wxrTerms.filter(t => t.domain === domain)) {
        const matches = (snapshot.taxonomies?.[catalog] ?? []).filter(t => canonicalSlug(t.slug) === canonicalSlug(term.nicename));
        if (matches.length !== 1 || matches[0].name !== term.name) issue('unresolved_wxr_term', domain);
        else resolved.push(matches[0].term_id ?? matches[0].id);
      }
      if (!Array.isArray(r[restKey]) || JSON.stringify([...resolved].sort((a,b)=>a-b)) !== JSON.stringify([...r[restKey]].sort((a,b)=>a-b))) issue('rest_wxr_taxonomy_mismatch', domain);
      terms[domain] = resolved;
    }
    const recommend = post.meta.recommend ?? [''];
    if (!Array.isArray(recommend) || recommend.length !== 1 || !['', '0', '1'].includes(recommend[0])) issue('invalid_recommend_meta', 'recommend');
    // Operational/SEO/oEmbed metadata is archived, never executed or silently treated as content.
    for (const key of Object.keys(post.meta)) if (!['recommend', '_recommend', '_edit_last', '_edit_lock', '_wp_old_slug', '_wp_old_date'].includes(key) && !/^_oembed_(?:time_)?[a-f0-9]{32}$/.test(key) && !key.startsWith('_aioseo_')) issue('unmapped_nonpublic_meta', 'meta');
    if (!Number.isSafeInteger(r.featured_media) || r.featured_media < 0) issue('invalid_featured_media', 'featured_media');
    if (r.status === 'draft' && r.slug === '') emptyDraftSlugIds.add(r.id);
    const raw = { id: r.id, title: r.title.raw, name: r.slug, published: r.date.slice(0,10).replaceAll('-', '/'), recommended: recommend[0],
      film_tags: terms.filmtags.map(term_id => ({ term_id })), event_tags: terms.eventtags.map(term_id => ({ term_id })), categories: terms.category.map(term_id => ({ term_id })),
      thumbnail: r.featured_media === 0 ? false : r.featured_media, content: r.content.rendered, tag_ids: terms.post_tag };
    combined.content.blogs.push(raw);
    origins.set(r.id, { post, raw, adapterIssues });
    counts[r.status]++;
  }
  requireValue(counts.draft === intake.counts?.draft && counts.private === intake.counts?.private, 'intake_count_mismatch');
  combined.counts.blogs = combined.content.blogs.length;
  const report = prepare(combined, sourceHashes.public, { emptyDraftSlugIds });
  // Public and nonpublic rows are distinguished by object identity, including duplicate IDs.
  for (const row of report.rows) {
    const origin = origins.get(row.legacyId);
    const nonpublic = origin && row.source.raw === origin.raw;
    row.publish = false;
    row.source.status = nonpublic ? origin.post.sourceStatus : 'publish';
    if (nonpublic) {
      row.source.adaptedRecordHash = row.source.recordHash;
      row.source.raw = structuredClone(origin.post);
      row.source.recordHash = hash(JSON.stringify(origin.post));
      row.source.originalUrl = origin.post.restRecord.link;
      row.source.created = origin.post.restRecord.date;
      row.source.modified = origin.post.restRecord.modified;
      row.source.urlDisposition = emptyDraftSlugIds.has(row.legacyId) ? 'new-url-required-on-publication' : 'unverified-nonpublic-slug';
      row.issues.push(...origin.adapterIssues);
      if (row.issues.length) row.candidate = null;
    }
  }
  const byType = {}, byCode = {}, byStatus = {};
  for (const row of report.rows) {
    for (const [collection, key] of [[byType, row.type], [byStatus, row.source.status]]) {
      const count = collection[key] ??= { total: 0, candidates: 0, blocked: 0 };
      count.total++; count[row.candidate ? 'candidates' : 'blocked']++;
    }
    for (const code of new Set(row.issues.map(i => i.code))) byCode[code] = (byCode[code] ?? 0) + 1;
  }
  return { ...report, schemaVersion: 'wordpress-combined-preflight/v1', sourceHashes, intakeSourceHashes: intake.sourceHashes,
    attachments: structuredClone(intake.attachments), summary: { total: report.rows.length, byType, byCode, byStatus },
    limitations: ['not an import or publication manifest; every row has publish:false', 'attachment usage, asset IDs, delivery visibility and URL ownership unverified', 'final synchronization and CMS access boundaries unverified'] };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    requireValue(process.argv.length === 5, 'usage');
    const local = await realpath(fileURLToPath(new URL('../../.local', import.meta.url)));
    const [publicPath, intakePath] = await Promise.all(process.argv.slice(2,4).map(p => realpath(resolve(p))));
    const output = resolve(process.argv[4]);
    const outputParent = await realpath(dirname(output));
    requireValue([publicPath, intakePath, outputParent].every(p => p === local || p.startsWith(local + sep)), 'local_paths_required');
    const [publicBytes, intakeBytes] = await Promise.all([readFile(publicPath), readFile(intakePath)]);
    const report = prepareCombined(JSON.parse(publicBytes), JSON.parse(intakeBytes), { public: hash(publicBytes), intake: hash(intakeBytes) });
    await writeFile(output, JSON.stringify(report, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    console.log(JSON.stringify(report.summary));
  } catch {
    // Parser errors may contain private source fragments; never echo them to logs.
    console.error('Combined conversion failed; check local inputs and unused output path.');
    process.exitCode = 1;
  }
}
