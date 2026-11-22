import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const require = createRequire(new URL('../package.json', import.meta.url));
const cms = createRequire(new URL('../../cms/package.json', import.meta.url));
const tiptap = createRequire(cms.resolve('@tiptap/starter-kit'));
const { JSDOM } = require('jsdom');
const { generateJSON, generateHTML, getSchema } = tiptap('@tiptap/core');
const StarterKit = cms('@tiptap/starter-kit').default;
const dom = new JSDOM(''); // No resource loading or script execution.
const extensions = [
  StarterKit.configure({ heading: { levels: [2, 3, 4] }, codeBlock: false, trailingNode: false }),
];
const pm = getSchema(extensions);
const Ajv = require('ajv/dist/2020.js').default;
const blogSchema = JSON.parse(
  await readFile(resolve(root, 'packages/content-schema/schemas/content/blog-draft.schema.json')),
);
const eventSchema = JSON.parse(
  await readFile(resolve(root, 'packages/content-schema/schemas/content/event-draft.schema.json')),
);
const ajv = new Ajv({ allErrors: true, strictTuples: false });
const validateBlog = ajv.compile(blogSchema),
  validateEvent = ajv.compile(eventSchema);
const filmMappings = JSON.parse(
  await readFile(resolve(root, 'packages/content-schema/mappings/wordpress-film-tags.json')),
).mappings;
const migrationDirectory = resolve(root, 'cms/migrations');
const tagsSql = (
  await Promise.all(
    (await readdir(migrationDirectory))
      .filter((name) => name.endsWith('.sql'))
      .sort()
      .map((name) => readFile(resolve(migrationDirectory, name), 'utf8')),
  )
).join('\n');
const categorySql = await readFile(resolve(root, 'cms/migrations/0008_blog_drafts.sql'), 'utf8');
const catalogs = {
  film: new Set([...tagsSql.matchAll(/VALUES \('([^']+)', 'film'/g)].map((m) => m[1])),
  event: new Set([...tagsSql.matchAll(/VALUES \('([^']+)', 'event'/g)].map((m) => m[1])),
  category: new Set(
    [...categorySql.matchAll(/blog_categories VALUES \('([^']+)'/g)].map((m) => m[1]),
  ),
};
const fields = {
  blogs:
    'id title name published recommended film_tags event_tags categories thumbnail content tag_ids',
  news: 'id title content published updated',
  events:
    'id title status date_from date_to place film_tags event_tags no content published updated address map dates_details access_details fee_details host_details appendix_contents',
  media:
    'id title media_name media_volume media_contents film_tags content published media_video media_pdf_url article_title article_subtitle article_contents',
  channels:
    'id title youtube_id created_year created_country running_time film_tags published updated content',
};
const types = {
  blogs: 'blog',
  news: 'news',
  events: 'event',
  media: 'pressCoverage',
  channels: 'video',
};
const hash = (value) => createHash('sha256').update(value).digest('hex');
const emptyBody = () => ({
  schemaVersion: 2,
  doc: { type: 'doc', content: [{ type: 'paragraph' }] },
});
const fail = (code, field, detail) => ({ code, field, detail });
const validDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}\/\d{2}\/\d{2}$/.test(value)) return false;
  const iso = value.replaceAll('/', '-'),
    date = new Date(iso);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === iso;
};
const isOwnAttachment = (value) => {
  try {
    const url = new URL(value);
    return (
      ['petiteadventurefilms.com', 'www.petiteadventurefilms.com'].includes(
        url.hostname.toLowerCase(),
      ) &&
      (/\/wp\/wp-content\/uploads\//i.test(url.pathname) || /\.pdf$/i.test(url.pathname))
    );
  } catch {
    return false;
  }
};
const validUrl = (value) => {
  if (/^mailto:[A-Za-z0-9.!#$%&'*+\-/=^_`{|}~]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value))
    return true;
  try {
    const u = new URL(value);
    return (
      ['http:', 'https:'].includes(u.protocol) &&
      !u.username &&
      !u.password &&
      !/[\u0000-\u0020\u007f]/.test(value)
    );
  } catch {
    return false;
  }
};
function stored(n) {
  const keys =
    n.type === 'link'
      ? ['href', 'target', 'title']
      : n.type === 'heading'
        ? ['level']
        : n.type === 'orderedList'
          ? ['start']
          : [];
  const attrs = Object.fromEntries(
    Object.entries(n.attrs ?? {}).filter(([k, v]) => keys.includes(k) && v != null),
  );
  return {
    type: n.type,
    ...(n.text !== undefined ? { text: n.text } : {}),
    ...(Object.keys(attrs).length ? { attrs } : {}),
    ...(n.content ? { content: n.content.map(stored) } : {}),
    ...(n.marks ? { marks: n.marks.map(stored) } : {}),
  };
}
export function convertBody(html, field = 'content') {
  if (typeof html !== 'string') return { issues: [fail('invalid_text', field, typeof html)] };
  const document = new dom.window.DOMParser().parseFromString(html, 'text/html');
  const issues = [],
    references = [];
  const allowed = new Set(
    'p br strong b em i u s strike a blockquote hr h2 h3 h4 ul ol li'.split(' '),
  );
  // Inspect head too: parseFromString can move unsupported source elements there.
  for (const el of document.querySelectorAll('*')) {
    const tag = el.localName;
    if (['html', 'head', 'body'].includes(tag)) {
      if (el.attributes.length) issues.push(fail('unsupported_attributes', field, tag));
      continue;
    }
    if (!allowed.has(tag))
      issues.push(
        fail(
          ['img', 'iframe'].includes(tag) ? 'unresolved_asset_or_embed' : 'unsupported_element',
          field,
          tag,
        ),
      );
    for (const attr of el.attributes) {
      if (['href', 'src'].includes(attr.name))
        references.push({ field, tag, attribute: attr.name, url: attr.value });
      if (
        !(tag === 'a' && ['href', 'target', 'rel', 'title'].includes(attr.name)) &&
        !(tag === 'ol' && attr.name === 'start')
      )
        issues.push(fail('unsupported_attribute', field, `${tag}.${attr.name}`));
    }
    if (tag === 'a' && (!validUrl(el.getAttribute('href') ?? '') || !el.textContent))
      issues.push(fail('unsupported_link', field, el.getAttribute('href')));
    if (tag === 'a' && isOwnAttachment(el.getAttribute('href') ?? ''))
      issues.push(fail('unresolved_attachment_link', field, el.getAttribute('href')));
    if (tag === 'ol' && el.hasAttribute('start') && !/^[1-9]\d*$/.test(el.getAttribute('start')))
      issues.push(fail('invalid_list_start', field, el.getAttribute('start')));
  }
  if (issues.length) return { issues, references };
  const previous = { window: globalThis.window, document: globalThis.document };
  try {
    globalThis.window = dom.window;
    globalThis.document = dom.window.document;
    const doc = stored(generateJSON(html, extensions));
    pm.nodeFromJSON(doc).check();
    const rendered = generateHTML(doc, extensions);
    const roundtrip = stored(generateJSON(rendered, extensions));
    if (JSON.stringify(doc) !== JSON.stringify(roundtrip)) throw Error('roundtrip_changed');
    const normalize = (element) => {
      function walk(node) {
        if (node.nodeType === 3) return node.textContent;
        if (node.nodeType !== 1) return '';
        if (node.localName === 'br') return '\n';
        const text = [...node.childNodes].map(walk).join('');
        return ['p', 'blockquote', 'h2', 'h3', 'h4', 'li', 'ul', 'ol'].includes(node.localName)
          ? `\n${text}\n`
          : text;
      }
      return walk(element).replace(/\s+/g, ' ').trim();
    };
    const output = new dom.window.DOMParser().parseFromString(rendered, 'text/html');
    if (normalize(document.body) !== normalize(output.body)) throw Error('text_changed');
    // Do not silently lose links, breaks or supported formatting during parsing.
    const counts = (d) =>
      [
        'a',
        'br',
        'hr',
        'ul',
        'ol',
        'li',
        'blockquote',
        'h2',
        'h3',
        'h4',
        'strong,b',
        'em,i',
        'u',
        's,strike',
      ].map((t) => d.body.querySelectorAll(t).length);
    if (JSON.stringify(counts(document)) !== JSON.stringify(counts(output)))
      throw Error('structure_changed');
    const body = { schemaVersion: 2, doc };
    if (
      !validateBlog({
        title: '',
        body,
        categoryId: null,
        filmTagIds: [],
        eventTagIds: [],
        isRecommended: false,
        isWorkshopReport: false,
      })
    )
      throw Error('body_schema');
    return { body, issues: [], references };
  } catch (error) {
    return { issues: [fail('body_conversion_failed', field, error.message)], references };
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete globalThis[key];
      else globalThis[key] = value;
    }
  }
}
function plain(html, field, issues) {
  if (typeof html !== 'string') {
    issues.push(fail('invalid_text', field, typeof html));
    return '';
  }
  const d = new dom.window.DOMParser().parseFromString(html, 'text/html');
  if (
    [...d.querySelectorAll('*')].some(
      (el) => !['html', 'head', 'body', 'p', 'br'].includes(el.localName) || el.attributes.length,
    )
  ) {
    issues.push(
      fail('event_rich_text_requires_contract', field, 'plain-text field cannot preserve HTML'),
    );
    return '';
  }
  for (const br of d.body.querySelectorAll('br')) br.replaceWith('\n');
  for (const p of d.body.querySelectorAll('p')) p.append('\n');
  return d.body.textContent.trim();
}
export function prepare(snapshot, sourceHash) {
  if (snapshot.schemaVersion !== 1 || !snapshot.content || !snapshot.counts || !snapshot.source)
    throw Error('invalid_snapshot');
  if (Object.keys(snapshot.content).some((k) => !(k in fields)))
    throw Error('unknown_content_group');
  const rows = [],
    seenIds = new Map(),
    seenPaths = new Map();
  const blogTags = new Set((snapshot.taxonomies?.blogTags ?? []).map((t) => t.id));
  for (const [group, expected] of Object.entries(fields)) {
    if (
      !Array.isArray(snapshot.content[group]) ||
      snapshot.counts[group] !== snapshot.content[group].length
    )
      throw Error(`count_mismatch:${group}`);
    for (const raw of snapshot.content[group]) {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw))
        throw Error(`invalid_record:${group}`);
      const issues = [],
        references = [],
        type = types[group];
      for (const k of Object.keys(raw))
        if (!expected.split(' ').includes(k))
          issues.push(fail('unmapped_field', k, 'not silently discarded'));
      for (const k of expected.split(' '))
        if (!(k in raw)) issues.push(fail('missing_field', k, 'required source field'));
      if (!Number.isSafeInteger(raw.id) || raw.id <= 0)
        issues.push(fail('invalid_id', 'id', raw.id));
      function text(k) {
        if (typeof raw[k] !== 'string') {
          issues.push(fail('invalid_text', k, typeof raw[k]));
          return '';
        }
        return raw[k];
      }
      function terms(k, kind) {
        const values = raw[k] === false ? [] : raw[k];
        if (!Array.isArray(values)) {
          issues.push(fail('invalid_taxonomy', k, typeof raw[k]));
          return [];
        }
        const ids = values.map((t) => String(t?.term_id));
        for (const id of ids)
          if (!catalogs[kind].has(id)) issues.push(fail('unknown_catalog_id', k, id));
        if (new Set(ids).size !== ids.length) issues.push(fail('duplicate_taxonomy', k, ids));
        return ids;
      }
      function body(k) {
        const result = convertBody(raw[k], k);
        issues.push(...result.issues);
        references.push(...(result.references ?? []));
        return result.body ?? emptyBody();
      }
      let slug;
      if (group === 'blogs') {
        try {
          slug = decodeURIComponent(text('name'));
          if (!slug || /[\s/\\?#\u0000-\u001f]/.test(slug) || slug === '.' || slug === '..')
            throw Error('invalid');
        } catch {
          issues.push(fail('invalid_slug', 'name', raw.name));
        }
      }
      const path =
        group === 'blogs'
          ? slug
            ? `/${encodeURIComponent(slug)}/`
            : null
          : group === 'news'
            ? null
            : `/${{ events: 'events', media: 'media', channels: 'channel' }[group]}/${raw.id}/`;
      let draft = {
        title: text('title'),
        ...(slug ? { slug } : {}),
        body: group === 'events' ? undefined : body('content'),
        filmTagIds: group === 'news' ? [] : terms('film_tags', 'film'),
      };
      const filmIds = draft.filmTagIds
        .map((id) => {
          const m = filmMappings.find((m) => String(m.legacyTermId) === id);
          if (!m) issues.push(fail('missing_film_mapping', 'film_tags', id));
          return m?.filmId;
        })
        .filter(Boolean);
      if (group === 'blogs') {
        const categories = terms('categories', 'category');
        if (categories.length !== 1)
          issues.push(fail('category_cardinality', 'categories', categories));
        if (!['', '0', '1'].includes(raw.recommended))
          issues.push(fail('invalid_boolean_source', 'recommended', raw.recommended));
        if (!Array.isArray(raw.tag_ids) || raw.tag_ids.some((id) => !blogTags.has(id)))
          issues.push(fail('unknown_blog_tag', 'tag_ids', raw.tag_ids));
        if (raw.thumbnail !== false && raw.thumbnail !== '')
          issues.push(fail('unresolved_thumbnail', 'thumbnail', raw.thumbnail));
        draft = {
          ...draft,
          categoryId: categories[0] ?? null,
          eventTagIds: terms('event_tags', 'event'),
          isRecommended: raw.recommended === '1',
          isWorkshopReport: Array.isArray(raw.tag_ids) && raw.tag_ids.includes(5026),
        };
        if (!validateBlog(draft))
          issues.push(fail('draft_schema', '', structuredClone(validateBlog.errors)));
      } else if (group === 'events') {
        if (!['', '1', '2'].includes(raw.status))
          issues.push(fail('unknown_event_status', 'status', raw.status));
        if (text('content').trim())
          issues.push(fail('unmapped_event_body', 'content', 'no draft field'));
        draft = {
          title: draft.title,
          startDate: text('date_from'),
          endDate: text('date_to'),
          timeDescription: plain(raw.dates_details, 'dates_details', issues),
          venue: text('place'),
          address: text('address'),
          mapUrl: text('map'),
          access: plain(raw.access_details, 'access_details', issues),
          venueNotes: '',
          fee: plain(raw.fee_details, 'fee_details', issues),
          organizer: plain(raw.host_details, 'host_details', issues),
          notes: plain(raw.appendix_contents, 'appendix_contents', issues),
          multiDay: raw.date_from !== raw.date_to && raw.date_to !== '',
          formats: ['offline'],
          status: { '': 'normal', 1: 'postponed', 2: 'cancelled' }[raw.status],
          filmTagIds: draft.filmTagIds,
          eventTagIds: terms('event_tags', 'event'),
        };
        // Online/offline and date interpretation need explicit mapping; do not infer from title.
        issues.push(
          fail(
            'event_format_mapping_required',
            'formats',
            'legacy source has no explicit format field',
          ),
        );
        if (!validateEvent(draft))
          issues.push(fail('draft_schema', '', structuredClone(validateEvent.errors)));
      } else if (group === 'media') {
        draft = {
          ...draft,
          sourceName: text('media_name'),
          sourceIssue: text('media_volume'),
          coverageLabel: text('media_contents'),
          attachmentAssetIds: [],
          youtubeId: text('media_video'),
          articleHeadline: text('article_title'),
          articleSubheadline: text('article_subtitle'),
          articleBody: body('article_contents'),
        };
        if (raw.media_pdf_url !== false && text('media_pdf_url')) {
          references.push({ field: 'media_pdf_url', url: raw.media_pdf_url });
          issues.push(fail('unresolved_attachment', 'media_pdf_url', raw.media_pdf_url));
        }
      } else if (group === 'channels')
        draft = {
          ...draft,
          youtubeId: text('youtube_id'),
          productionYear: text('created_year'),
          productionCountry: text('created_country'),
          duration: text('running_time'),
        };
      for (const key of ['published', 'updated'])
        if (key in raw && !validDate(raw[key])) issues.push(fail('invalid_date', key, raw[key]));
      if (group !== 'events') {
        if (
          !validateBlog({
            title: draft.title,
            body: draft.body,
            filmTagIds: draft.filmTagIds,
            categoryId: null,
            eventTagIds: [],
            isRecommended: false,
            isWorkshopReport: false,
            ...(draft.slug ? { slug: draft.slug } : {}),
          })
        )
          issues.push(fail('draft_schema', '', structuredClone(validateBlog.errors)));
        for (const key of [
          'sourceName',
          'sourceIssue',
          'coverageLabel',
          'youtubeId',
          'articleHeadline',
          'articleSubheadline',
          'productionYear',
          'productionCountry',
          'duration',
        ]) {
          const limit = key === 'productionYear' ? 20 : key === 'duration' ? 40 : 200;
          if (key in draft && draft[key].length > limit)
            issues.push(fail('draft_field_length', key, limit));
        }
      }
      const row = {
        type,
        legacyId: raw.id,
        source: {
          recordHash: hash(JSON.stringify(raw)),
          published: raw.published,
          ...(raw.updated ? { updated: raw.updated } : {}),
          path,
          ...(group === 'news'
            ? {
                anchor: `news-${raw.id}`,
                routeVerification: 'numbered listing location must be reconciled in #391',
              }
            : {}),
          raw,
        },
        mappings: { filmIds },
        references,
        issues,
        candidate: issues.length ? null : draft,
      };
      for (const [map, key, code] of [
        [seenIds, raw.id, 'duplicate_id'],
        [seenPaths, path, 'duplicate_path'],
      ]) {
        if (key == null) continue;
        if (map.has(key)) {
          const previous = map.get(key);
          const issue = fail(code, code === 'duplicate_id' ? 'id' : 'name', key);
          previous.issues.push(issue);
          previous.candidate = null;
          row.issues.push(issue);
          row.candidate = null;
        } else map.set(key, row);
      }
      rows.push(row);
    }
  }
  const byType = {},
    byCode = {};
  for (const row of rows) {
    byType[row.type] ??= { total: 0, candidates: 0, blocked: 0 };
    const s = byType[row.type];
    s.total++;
    s[row.candidate ? 'candidates' : 'blocked']++;
    for (const code of new Set(row.issues.map((i) => i.code)))
      byCode[code] = (byCode[code] ?? 0) + 1;
  }
  return {
    schemaVersion: 'wordpress-conversion-preflight/v1',
    sourceHash,
    source: snapshot.source,
    limitations: [
      'public snapshot only; private/draft coverage unknown',
      'not a publish/import manifest; no asset or URL ownership validation',
      'source freshness and final synchronization unverified',
    ],
    summary: { total: rows.length, byType, byCode },
    rows,
  };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const input = resolve(process.argv[2] ?? resolve(root, 'astro/data/wordpress-export.json'));
  const output = resolve(
    process.argv[3] ?? resolve(root, '.local/wordpress-conversion/report.json'),
  );
  const source = await readFile(input);
  const result = prepare(JSON.parse(source), hash(source));
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify(result, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  console.log(JSON.stringify(result.summary, null, 2));
  console.log(`Report: ${output}`);
}
