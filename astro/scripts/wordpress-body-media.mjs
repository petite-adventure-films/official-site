import { readFile } from 'node:fs/promises';
import { validateAsset } from './prepare-wordpress-asset-map.mjs';
import {
  imageAttributes,
} from '../../packages/content-schema/body-media.ts';
import { mediaTypes } from '../../packages/content-schema/media-policy.ts';
const decisions = JSON.parse(
  await readFile(
    new URL(
      '../../specs/011-wordpress-conversion/media-recovery-decisions.json',
      import.meta.url,
    ),
  ),
).decisions;
const exclusions = JSON.parse(await readFile(new URL('../../specs/011-wordpress-conversion/body-exclusions.json', import.meta.url))).images;
const check = (ok, code) => {
  if (!ok) throw Error(code);
};
const normalize = (value) => {
  const u = new URL(value);
  check(
    ['http:', 'https:'].includes(u.protocol) &&
      !u.username &&
      !u.password &&
      ['petiteadventurefilms.com', 'www.petiteadventurefilms.com'].includes(
        u.hostname,
      ) &&
      u.pathname.startsWith('/wp/wp-content/uploads/'),
    'unsupported_media_url',
  );
  u.search = '';
  u.hash = '';
  return u.href;
};
export function createMediaResolver(map) {
  check(
    map.schemaVersion === 'wordpress-asset-map/v1' &&
      map.target?.database === 'paf-cms-migration-db' &&
      map.target?.bucket === 'paf-cms-migration-media',
    'invalid_asset_map',
  );
  const assets = new Map(),
    urls = new Map();
  for (const a of map.assets) {
    check(validateAsset(a) && !assets.has(a.id), 'invalid_map_asset');
    assets.set(a.id, a);
  }
  const path = (id) => {
    const a = assets.get(id);
    check(a, 'missing_map_asset');
    return `https://paf-cms-migration-media.petiteadventurefilms2.workers.dev/media/${id}.${mediaTypes[a.original.mimeType]}`;
  };
  for (const e of map.entries) {
    check(
      normalize(e.sourceUrl) === e.sourceUrl && !urls.has(e.sourceUrl),
      'duplicate_or_invalid_map_url',
    );
    check(
      ['registered', 'recovered', 'excluded'].includes(e.disposition),
      'invalid_map_disposition',
    );
    if (e.disposition !== 'registered')
      check(
        decisions.some(
          (d) =>
            JSON.stringify(d) === JSON.stringify(e.decision) &&
            d.sourceUrl === e.sourceUrl &&
            d.decision ===
              (e.disposition === 'excluded' ? 'exclude' : 'recover-original'),
        ),
        'unapproved_media_decision',
      );
    if (e.disposition !== 'excluded') {
      const a = assets.get(e.assetId);
      check(
        a &&
          a.kind === e.kind &&
          a.original.sha256 === e.sha256 &&
          e.deliveryUrl === path(e.assetId),
        'map_asset_mismatch',
      );
      if (e.disposition === 'recovered')
        check(
          a.original.sha256 === e.decision.sha256,
          'recovery_hash_mismatch',
        );
    } else
      check(
        e.assetId === null && e.deliveryUrl === null,
        'invalid_excluded_asset',
      );
    urls.set(e.sourceUrl, e);
  }
  check(
    map.summary.assets === assets.size && map.summary.urls === urls.size,
    'map_count_mismatch',
  );
  return {
    path,
    assets,
    resolve(value, legacyId) {
      const input = new URL(value);
      check(!input.search && !input.hash, 'media_url_modifier_requires_review');
      const e = urls.get(normalize(value));
      check(e, 'unregistered_body_asset');
      if (e.decision)
        check(
          e.decision.articleIds.includes(legacyId),
          'decision_article_mismatch',
        );
      return e;
    },
  };
}
export function rewriteBodyMedia(
  document,
  resolver,
  legacyId,
  field,
  transformations,
  references,
) {
  const record = (element, from, to, reason) =>
    transformations.push({ field, tag: element.localName, from, to, reason });
  // Never accept internal markers supplied by source HTML.
  check(!document.querySelector('[data-paf-asset]'), 'untrusted_asset_marker');
  for (const exclusion of exclusions.filter(e => e.articleId === legacyId)) {
    check([...document.querySelectorAll('img')].filter(img => img.getAttribute('src') === exclusion.sourceUrl).length <= 1, 'exclusion_source_changed');
  }
  for (const img of [...document.querySelectorAll('img')]) {
    const original = img.outerHTML;
    const exclusion = exclusions.find(e => e.articleId === legacyId && e.sourceUrl === img.getAttribute('src'));
    if (exclusion) {
      check(img.attributes.length === Object.keys(exclusion.attributes).length && Object.entries(exclusion.attributes).every(([key,value])=>img.getAttribute(key) === value) && !img.closest('a'), 'exclusion_source_changed');
      record(img,original,null,'approved-transparent-image-exclusion');references.push({field,tag:'img',attribute:'src',url:exclusion.sourceUrl});img.remove();continue;
    }
    check(
      [...img.attributes].every((a) =>
        [
          'src',
          'alt',
          'title',
          'width',
          'height',
          'class',
          'loading',
          'decoding',
          'srcset',
          'sizes',
        ].includes(a.name),
      ),
      'unsupported_image_attribute',
    );
    const src = img.getAttribute('src');
    references.push({ field, tag: 'img', attribute: 'src', url: src });
    const entry = resolver.resolve(src, legacyId);
    if (entry.disposition === 'excluded') {
      check(
        !img.parentElement?.matches('a'),
        'excluded_linked_image_requires_review',
      );
      record(img, original, null, 'approved-image-exclusion');
      img.remove();
      continue;
    }
    check(entry.kind === 'image', 'image_asset_kind_mismatch');
    const attrs = {
      assetId: entry.assetId,
      alt: img.getAttribute('alt') ?? '',
    };
    for (const k of ['title', 'loading', 'decoding', 'sizes'])
      if (img.hasAttribute(k)) attrs[k] = img.getAttribute(k);
    for (const k of ['width', 'height'])
      if (img.hasAttribute(k)) {
        check(
          /^[1-9]\d{0,4}$/.test(img.getAttribute(k)),
          'invalid_image_dimension',
        );
        attrs[k] = Number(img.getAttribute(k));
      }
    if (img.hasAttribute('class'))
      attrs.legacyClass = img
        .getAttribute('class')
        .trim()
        .split(/\s+/)
        .join(' ');
    if (img.hasAttribute('srcset')) {
      attrs.sources = img
        .getAttribute('srcset')
        .split(',')
        .map((part) => {
          const m = part.trim().match(/^(\S+) ([1-9]\d{0,4})w$/);
          check(m, 'unsupported_srcset');
          const e = resolver.resolve(m[1], legacyId);
          check(
            e.kind === 'image' && e.disposition === 'registered',
            'unresolved_srcset',
          );
          check(
            resolver.assets.get(e.assetId).original.width === Number(m[2]),
            'srcset_width_mismatch',
          );
          references.push({
            field,
            tag: 'img',
            attribute: 'srcset',
            url: m[1],
          });
          return { assetId: e.assetId, width: Number(m[2]) };
        });
      check(
        new Set(attrs.sources.map((s) => s.width)).size ===
          attrs.sources.length,
        'duplicate_srcset_width',
      );
    }
    if (entry.disposition === 'recovered' && attrs.width && attrs.height) {
      const o = resolver.assets.get(entry.assetId).original;
      attrs.height = Math.max(
        1,
        Math.round((attrs.width * o.height) / o.width),
      );
    }
    for (const a of [...img.attributes]) img.removeAttribute(a.name);
    for (const [k, v] of Object.entries(imageAttributes(attrs, resolver.path)))
      img.setAttribute(k, String(v));
    img.setAttribute('data-paf-asset', JSON.stringify(attrs));
    record(
      img,
      original,
      attrs,
      entry.disposition === 'recovered'
        ? 'approved-original-recovery'
        : 'registered-image-reference',
    );
  }
  for (const a of document.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href');
    let own = false;
    try {
      normalize(href);
      own = true;
    } catch {
      continue;
    }
    if (!own) continue;
    check(
      [...a.attributes].every((attr) =>
        ['href', 'target', 'title', 'rel', 'class'].includes(attr.name),
      ),
      'unsupported_attachment_link_attribute',
    );
    const entry = resolver.resolve(href, legacyId);
    check(entry.disposition !== 'excluded', 'excluded_link_requires_review');
    const attrs = { assetId: entry.assetId, assetKind: entry.kind };
    for (const k of ['target', 'title'])
      if (a.hasAttribute(k)) attrs[k] = a.getAttribute(k);
    references.push({ field, tag: 'a', attribute: 'href', url: href });
    record(a, href, attrs, 'registered-attachment-link');
    a.setAttribute('href', resolver.path(entry.assetId));
    a.setAttribute('data-paf-asset', JSON.stringify(attrs));
  }
}
