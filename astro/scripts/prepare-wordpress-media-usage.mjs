// #373 / #494: local usage evidence, not a registration or publication manifest.
import { createHash } from 'node:crypto';
import { readFile, realpath, writeFile } from 'node:fs/promises';
import { resolve, dirname, sep, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseAttachmentMetadata } from './wordpress-attachment-metadata.mjs';
const uploads = '/wp/wp-content/uploads/';
const digest = (value) => createHash('sha256').update(value).digest('hex');
const check = (condition, code) => {
  if (!condition) throw Error(code);
};
function normalize(value) {
  const url = new URL(
    value
      .replaceAll('&amp;', '&')
      .replaceAll('&#038;', '&')
      .replaceAll('&#38;', '&'),
  );
  check(
    ['http:', 'https:'].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      !url.port &&
      ['www.petiteadventurefilms.com', 'petiteadventurefilms.com'].includes(
        url.hostname,
      ) &&
      url.pathname.startsWith(uploads),
    'unapproved_media_url',
  );
  url.search = '';
  url.hash = '';
  return url.href;
}
function walk(value, visit, field = '') {
  if (typeof value === 'string') visit(value, field);
  else if (value && typeof value === 'object')
    for (const [key, child] of Object.entries(value))
      walk(child, visit, field ? `${field}.${key}` : key);
}
export function prepareMediaUsage(publicBytes, intakeBytes, transferBytes) {
  const snapshot = JSON.parse(publicBytes),
    intake = JSON.parse(intakeBytes),
    transfer = JSON.parse(transferBytes);
  check(
    snapshot.schemaVersion === 1 &&
      intake.schemaVersion === 'wordpress-nonpublic-intake/v1' &&
      transfer.schemaVersion === 'wordpress-media-transfer-preflight/v1',
    'invalid_inputs',
  );
  const urls = new Map(),
    articles = [],
    attachmentUrls = new Map(),
    attachmentRows = [];
  function addAttachment(url, id, kind) {
    const key = normalize(url),
      entries = attachmentUrls.get(key) ?? [];
    if (!entries.some((e) => e.legacyId === id && e.kind === kind))
      entries.push({ legacyId: id, kind });
    attachmentUrls.set(key, entries);
  }
  for (const attachment of intake.attachments) {
    check(
      Number.isSafeInteger(attachment.legacyId) &&
        attachment.legacyId > 0 &&
        !attachmentRows.some((a) => a.legacyId === attachment.legacyId),
      'invalid_attachment_id',
    );
    const entry = {
      legacyId: attachment.legacyId,
      parentId: attachment.parentId,
      sourceHash: digest(JSON.stringify(attachment)),
      metadataState: 'parsed',
    };
    attachmentRows.push(entry);
    try {
      addAttachment(attachment.url, attachment.legacyId, 'original');
      check(
        attachment.meta._wp_attached_file?.length === 1 &&
          attachment.meta._wp_attachment_metadata?.length === 1,
        'missing_metadata',
      );
      const metadata = parseAttachmentMetadata(
        attachment.meta._wp_attachment_metadata[0],
      );
      const file = attachment.meta._wp_attached_file[0];
      check(
        typeof file === 'string' && metadata && metadata.file === file,
        'attachment_file_mismatch',
      );
      const base = new URL(normalize(attachment.url));
      check(
        decodeURI(base.pathname.slice(uploads.length)) === file,
        'attachment_url_mismatch',
      );
      const variants = [];
      for (const size of Object.values(metadata.sizes ?? {})) {
        check(
          typeof size.file === 'string' &&
            posix.basename(size.file) === size.file &&
            !/[?#\\]/.test(size.file) &&
            size.file !== '.' &&
            size.file !== '..',
          'invalid_size_file',
        );
        const variant = new URL(base.href);
        variant.pathname =
          base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) +
          encodeURIComponent(size.file);
        variants.push(variant.href);
      }
      for (const variant of variants)
        addAttachment(variant, attachment.legacyId, 'declared-size');
    } catch {
      entry.metadataState = 'needs-reconciliation';
    }
  }
  const seen = new Set();
  function article(type, id, status, fields, sourceHash) {
    check(
      Number.isSafeInteger(id) && id > 0 && !seen.has(id),
      'duplicate_or_invalid_article',
    );
    seen.add(id);
    const entry = {
      type,
      legacyId: id,
      sourceStatus: status,
      sourceHash,
      occurrences: [],
      unparsed: [],
    };
    articles.push(entry);
    walk(fields, (text, field) => {
      const covered = [];
      for (const match of text.matchAll(/https?:\/\/[^\s"'<>\\]+/giu)) {
        const rawUrl = match[0];
        if (!rawUrl.includes(uploads)) continue;
        const start = match.index,
          end = start + rawUrl.length;
        covered.push([start, end]);
        let normalizedUrl;
        try {
          normalizedUrl = normalize(rawUrl);
        } catch {
          entry.unparsed.push({
            field,
            start,
            end,
            reason: 'unapproved-url',
            rawUrl,
          });
          continue;
        }
        const occurrence = { field, start, end, rawUrl, normalizedUrl };
        entry.occurrences.push(occurrence);
        const url = urls.get(normalizedUrl) ?? {
          url: normalizedUrl,
          references: [],
        };
        url.references.push({
          type,
          legacyId: id,
          sourceStatus: status,
          field,
          start,
          end,
        });
        urls.set(normalizedUrl, url);
      }
      for (const match of text.matchAll(/\/wp\/wp-content\/uploads\//g))
        if (
          !covered.some(
            ([start, end]) => start <= match.index && match.index < end,
          )
        )
          entry.unparsed.push({
            field,
            start: match.index,
            reason: 'non-absolute-or-unparsed-reference',
          });
      // Unexpanded shortcodes may carry attachment IDs without a URL. Do not infer their contents.
      if (/\[(?:gallery|playlist)\b/i.test(text))
        entry.unparsed.push({ field, reason: 'unexpanded-media-shortcode' });
    });
  }
  const types = {
    blogs: 'blog',
    news: 'news',
    events: 'event',
    media: 'pressCoverage',
    channels: 'video',
  };
  check(
    Object.keys(snapshot.content).every((group) => Object.hasOwn(types, group)),
    'unknown_content_group',
  );
  for (const [group, type] of Object.entries(types)) {
    check(
      Array.isArray(snapshot.content[group]) &&
        snapshot.counts[group] === snapshot.content[group].length,
      'public_count_mismatch',
    );
    for (const row of snapshot.content[group])
      article(type, row.id, 'publish', row, digest(JSON.stringify(row)));
  }
  const statuses = { draft: 0, private: 0 };
  for (const post of intake.posts) {
    const r = post.restRecord;
    check(
      ['draft', 'private'].includes(post.sourceStatus) &&
        r.status === post.sourceStatus &&
        post.publish === false &&
        r.id === post.legacyId,
      'invalid_nonpublic_status',
    );
    check(
      typeof r.content?.raw === 'string' &&
        typeof r.content?.rendered === 'string',
      'missing_nonpublic_body',
    );
    check(
      r.featured_media === undefined || r.featured_media === 0,
      'featured_media_requires_resolution',
    );
    statuses[r.status]++;
    // Raw and rendered are both evidence, explicitly distinguished; no WXR metadata is mistaken for body usage.
    article(
      'blog',
      post.legacyId,
      post.sourceStatus,
      { raw: r.content.raw, rendered: r.content.rendered },
      digest(JSON.stringify(post)),
    );
  }
  check(
    statuses.draft === intake.counts.draft &&
      statuses.private === intake.counts.private,
    'nonpublic_count_mismatch',
  );
  const oldUrls = new Map(),
    objects = new Map();
  for (const o of transfer.objects) {
    check(!objects.has(o.original.storageKey), 'duplicate_transfer_object');
    objects.set(o.original.storageKey, o);
  }
  for (const u of transfer.urls) {
    check(!oldUrls.has(u.url), 'duplicate_transfer_url');
    oldUrls.set(u.url, u);
  }
  const usedAttachments = new Set();
  for (const entry of urls.values()) {
    const publicUse = entry.references.some(
        (r) => r.sourceStatus === 'publish',
      ),
      privateUse = entry.references.some((r) => r.sourceStatus !== 'publish');
    entry.usage =
      publicUse && privateUse
        ? 'shared'
        : publicUse
          ? 'public-only'
          : 'nonpublic-only';
    entry.delivery = 'not-authorized-by-this-report';
    entry.attachments = attachmentUrls.get(entry.url) ?? [];
    const ids = new Set(entry.attachments.map((a) => a.legacyId));
    entry.attachmentMatch =
      ids.size > 1 ? 'ambiguous' : ids.size === 1 ? 'matched' : 'not-in-wxr';
    if (ids.size === 1) usedAttachments.add([...ids][0]);
    const old = oldUrls.get(entry.url),
      object = old && objects.get(old.storageKey);
    entry.acquisition = old?.state ?? 'not-in-existing-transfer';
    if (object)
      entry.cachedEvidence = {
        storageKey: object.original.storageKey,
        sha256: object.original.sha256,
        localPath: object.localPath,
        sizeBytes: object.original.sizeBytes,
        note: 'prior local verification only; bytes must be rechecked before registration',
      };
    if (old?.state === 'planned')
      check(object?.state === 'planned', 'missing_transfer_object');
  }
  for (const entry of attachmentRows)
    entry.usage = usedAttachments.has(entry.legacyId)
      ? 'referenced'
      : 'not-proven-referenced';
  const list = [...urls.values()].sort((a, b) =>
    a.url < b.url ? -1 : a.url > b.url ? 1 : 0,
  );
  const countBy = (items, field) =>
    items.reduce((counts, item) => {
      counts[item[field]] = (counts[item[field]] ?? 0) + 1;
      return counts;
    }, {});
  return {
    schemaVersion: 'wordpress-combined-media-usage/v1',
    inputHashes: {
      public: digest(publicBytes),
      intake: digest(intakeBytes),
      transfer: digest(transferBytes),
    },
    limitations: [
      'URL occurrence inventory, not HTML rendering or complete shortcode analysis',
      'exact normalized URL joins only; no scheme/host aliases or filename guesses',
      'raw and rendered occurrences counted separately; WXR membership/parent is not usage',
      'no asset IDs, uploads, publication authorization or current byte verification',
    ],
    summary: {
      articles: articles.length,
      urls: list.length,
      occurrences: articles.reduce((n, a) => n + a.occurrences.length, 0),
      unparsed: articles.reduce((n, a) => n + a.unparsed.length, 0),
      usage: countBy(list, 'usage'),
      acquisition: countBy(list, 'acquisition'),
      attachments: attachmentRows.length,
      attachmentUsage: countBy(attachmentRows, 'usage'),
      attachmentMetadata: countBy(attachmentRows, 'metadataState'),
      nonpublic: {
        urls: list.filter((u) => u.usage !== 'public-only').length,
        acquisition: countBy(
          list.filter((u) => u.usage !== 'public-only'),
          'acquisition',
        ),
        attachmentMatch: countBy(
          list.filter((u) => u.usage !== 'public-only'),
          'attachmentMatch',
        ),
      },
    },
    articles,
    urls: list,
    attachments: attachmentRows,
    problems: [],
  };
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    check(process.argv.length === 6, 'usage');
    const local = await realpath(
      fileURLToPath(new URL('../../.local', import.meta.url)),
    );
    const inputs = await Promise.all(
      process.argv.slice(2, 5).map((p) => realpath(resolve(p))),
    );
    const output = resolve(process.argv[5]),
      parent = await realpath(dirname(output));
    check(
      [...inputs, parent].every(
        (p) => p === local || p.startsWith(local + sep),
      ),
      'local_paths_required',
    );
    const report = prepareMediaUsage(
      ...(await Promise.all(inputs.map((p) => readFile(p)))),
    );
    await writeFile(output, JSON.stringify(report, null, 2) + '\n', {
      flag: 'wx',
      mode: 0o600,
    });
    console.log(JSON.stringify(report.summary));
  } catch {
    console.error(
      'Media usage audit failed; check local inputs and unused output path.',
    );
    process.exitCode = 1;
  }
}
