// #338: read-only article reference join; never creates asset IDs or rewrites content.
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeMediaUrl } from './inventory-wordpress-media.mjs';
import { writeTransfer } from './prepare-wordpress-media-transfer.mjs';

const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const types = { blogs: 'blog', news: 'news', events: 'event', media: 'media', channels: 'channel' };
const uploads = '/wp/wp-content/uploads/';
function strings(value, visit, path = []) {
  if (typeof value === 'string') return visit(value, path.join('.'));
  if (Array.isArray(value)) return value.forEach((v, i) => strings(v, visit, [...path, String(i)]));
  if (value && typeof value === 'object')
    for (const [key, child] of Object.entries(value)) strings(child, visit, [...path, key]);
}
export function prepareReferences(snapshotBytes, manifestBytes) {
  const snapshot = JSON.parse(snapshotBytes),
    manifest = JSON.parse(manifestBytes);
  if (
    manifest.schemaVersion !== 'wordpress-media-transfer-preflight/v1' ||
    manifest.snapshotHash !== hash(snapshotBytes)
  )
    throw Error('transfer_snapshot_mismatch');
  const urls = new Map(),
    objects = new Map();
  for (const object of manifest.objects) {
    const key = object.original.storageKey;
    if (objects.has(key)) throw Error('duplicate_object');
    objects.set(key, object);
  }
  for (const entry of manifest.urls) {
    if (urls.has(entry.url)) throw Error('duplicate_url');
    if (!['planned', 'missing', 'candidate-only', 'blocked-upload-limit'].includes(entry.state))
      throw Error('unknown_transfer_state');
    if (entry.state === 'planned' && objects.get(entry.storageKey)?.state !== 'planned')
      throw Error('missing_planned_object');
    urls.set(entry.url, entry);
  }
  const articles = [],
    ids = new Set();
  for (const [collection, records] of Object.entries(snapshot.content)) {
    if (!types[collection] || !Array.isArray(records)) throw Error('unknown_collection');
    for (const record of records) {
      const identity = `${collection}:${record.id}`;
      if (!Number.isSafeInteger(record.id) || ids.has(identity)) throw Error('invalid_article_id');
      ids.add(identity);
      const references = [],
        unparsed = [];
      strings(record, (text, field) => {
        if (!text.includes(uploads)) return;
        const covered = [];
        for (const match of text.matchAll(/https?:\/\/[^\s"'<>\\]+/giu)) {
          const rawUrl = match[0];
          if (!rawUrl.includes(uploads)) continue;
          const start = match.index;
          covered.push([start, start + rawUrl.length]);
          // Keep raw spelling and offsets. Decode only the HTML entities already supported by #337.
          const decoded = rawUrl
            .replaceAll('&amp;', '&')
            .replaceAll('&#038;', '&')
            .replaceAll('&#38;', '&');
          let normalized;
          try {
            normalized = normalizeMediaUrl(decoded);
          } catch {
            /* report below */
          }
          const entry = normalized && urls.get(normalized.sourceUrl);
          const owned = entry?.sources.some(
            (s) =>
              s.role === 'referenced' &&
              s.references.some(
                (r) =>
                  r.type === types[collection] &&
                  r.legacyId === record.id &&
                  r.fields.includes(field),
              ),
          );
          const state = !normalized
            ? 'invalid-url'
            : !entry
              ? 'unmapped'
              : !owned
                ? 'unmatched-source'
                : entry.state;
          references.push({
            field,
            start,
            end: start + rawUrl.length,
            rawUrl,
            ...(normalized ? { normalizedUrl: normalized.sourceUrl } : {}),
            state,
            ...(state === 'planned' ? { storageKey: entry.storageKey } : {}),
            ...(entry?.reason ? { reason: entry.reason } : {}),
          });
        }
        for (const match of text.matchAll(/\/wp\/wp-content\/uploads\//g)) {
          if (!covered.some(([start, end]) => start <= match.index && match.index < end))
            unparsed.push({
              field,
              offset: match.index,
              reason: 'non-absolute-or-unparsed-reference',
            });
        }
      });
      articles.push({
        collection,
        legacyId: record.id,
        sourceHash: hash(JSON.stringify(record)),
        references,
        unparsed,
      });
    }
  }
  const counts = {};
  for (const article of articles)
    for (const ref of article.references) counts[ref.state] = (counts[ref.state] ?? 0) + 1;
  return {
    schemaVersion: 'wordpress-media-references-preflight/v1',
    snapshotHash: hash(snapshotBytes),
    transferManifestHash: hash(manifestBytes),
    limitations: [
      'local planned storage keys only; no assetId, upload or content rewrite',
      'absolute upload-path URL occurrences only; unmatched paths are reported',
      'raw offsets are JavaScript UTF-16 string offsets; query/fragment retained only in rawUrl',
    ],
    summary: {
      articles: articles.length,
      articlesWithReferences: articles.filter((a) => a.references.length).length,
      references: articles.reduce((n, a) => n + a.references.length, 0),
      states: counts,
      unparsed: articles.reduce((n, a) => n + a.unparsed.length, 0),
    },
    articles,
  };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length !== 3 || args.some((a) => a.startsWith('--')))
    throw Error('usage: <snapshot.json> <transfer-manifest.json> <new-output.json>');
  const result = prepareReferences(await readFile(args[0]), await readFile(args[1]));
  await writeTransfer(resolve(args[2]), result);
  console.log(JSON.stringify(result.summary, null, 2));
}
