import { rewriteBodyMedia } from './wordpress-body-media.mjs';
import { imageTypes, imageKeys, assetLinkKeys, imageAttributes, assetLinkAttributes } from '../../packages/content-schema/body-media.ts';
import { semanticKeys, preservedTypes, semanticHtml, containerHtml, validBodyAnchors } from '../../packages/content-schema/legacy-containers.ts';
import { legacyColorCorrections, legacyStyleKeys, legacyStyleFromElement, legacyStyleHtml } from '../../packages/content-schema/legacy-text-style.ts';
import {
  externalVideoKeys,
  videoFromElement,
  videoFrameAttributes,
} from '../../packages/content-schema/external-video.ts';
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
const { generateJSON, generateHTML, getSchema, Node, Mark, Extension } = tiptap('@tiptap/core');
const StarterKit = cms('@tiptap/starter-kit').default;
const dom = new JSDOM(''); // No resource loading or script execution.
function isMixedVideo(element) {
  return element.parentElement?.localName === 'p' && [...element.parentElement.childNodes].some(node => node !== element && !(node.nodeType === 3 && !node.textContent.trim()));
}
function legacyAttrs(element) {
  const attrs = Object.fromEntries(semanticKeys.map(key => [key, element.getAttribute(key === 'anchorId' ? 'id' : key)]).filter(([, value]) => value !== null));
  semanticHtml(attrs);
  return { ...attrs, ...(element.hasAttribute('aria-label') ? {ariaLabel:element.getAttribute('aria-label')} : {}), ...(element.hasAttribute('style') ? legacyStyleFromElement(element) : {}) };
}
let mediaPath = () => { throw Error('unresolved_media_path'); };
const extensions = [
  Extension.create({name:'legacyLinkBoundaries',addGlobalAttributes(){return [{types:['link'],attributes:{legacyBoundary:{default:null,parseHTML:el=>el.hasAttribute('data-paf-boundary')?Number(el.getAttribute('data-paf-boundary')):null,renderHTML:attrs=>attrs.legacyBoundary==null?{}:{'data-paf-boundary':attrs.legacyBoundary}}}}];}}),
  ...[['inlineAssetImage', true], ['assetImage', false]].map(([name, inline]) => Node.create({
    name, group: inline ? 'inline' : 'block', inline, atom: true,
    addAttributes() { return Object.fromEntries(imageKeys.map(key => [key, {default: null}])); },
    parseHTML() { return [{tag: 'img[data-paf-asset]', getAttrs: el => {
      const isInline = ['p','h2','h3','h4','span','a','strong','b','em','i','u','s','strike'].includes(el.parentElement?.localName) || el.parentElement?.getAttribute('data-paf-node') === 'preservedTextBlock' || (el.parentElement?.localName === 'body' && [...el.parentElement.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()));
      return isInline === inline ? JSON.parse(el.getAttribute('data-paf-asset')) : false;
    }}]; },
    renderHTML({node}) { const attrs=Object.fromEntries(Object.entries(node.attrs).filter(([,v])=>v!=null));return ['img',{...imageAttributes(attrs,mediaPath),'data-paf-asset':JSON.stringify(attrs)}]; }
  })),
  Mark.create({name:'assetLink', priority:1100, excludes:'link assetLink', inclusive:false,
    addAttributes(){return Object.fromEntries(assetLinkKeys.map(key=>[key,{default:null}]));},
    parseHTML(){return [{tag:'a[data-paf-asset]',getAttrs:el=>JSON.parse(el.getAttribute('data-paf-asset'))}];},
    renderHTML({mark}){const attrs=Object.fromEntries(Object.entries(mark.attrs).filter(([,v])=>v!=null));return ['a',{...assetLinkAttributes(attrs,mediaPath),'data-paf-asset':JSON.stringify(attrs), ...(attrs.legacyBoundary == null ? {} : {'data-paf-boundary':attrs.legacyBoundary})},0];}
  }),
  Extension.create({ name: 'legacySemantics', addGlobalAttributes() { return [{ types: ['paragraph', 'heading'], attributes: Object.fromEntries(semanticKeys.map(key => [key, { default: null, parseHTML: element => element.getAttribute(key === 'anchorId' ? 'id' : key), renderHTML: attrs => attrs[key] === null ? {} : semanticHtml({ [key]: attrs[key] }) }])) }]; } }),
  ...[["preservedStrong", 'strong', 'inline*', true], ['preservedInline', 'span', 'inline*', true], ['preservedTextBlock', 'div', 'inline*', false], ['preservedBlock', 'div', 'block*', false]].map(([name, tag, content, inline]) => Node.create({
    name, priority:name === 'preservedStrong' ? 1100 : 100, group: inline ? 'inline' : 'block', inline, content,
    addAttributes() { return Object.fromEntries([...semanticKeys, ...legacyStyleKeys, ...(name === 'preservedInline' ? ['ariaLabel'] : [])].map(key => [key, { default: null }])); },
    parseHTML() { return [{ tag: `${tag}[data-paf-node="${name}"]`, priority: name === 'preservedStrong' ? 1000 : 50, getAttrs: legacyAttrs }]; },
    renderHTML({ node }) { return [tag, { ...containerHtml(Object.fromEntries(Object.entries(node.attrs).filter(([, value]) => value !== null))), 'data-paf-node': name }, 0]; },
  })),
  Node.create({
    name: 'inlineExternalVideo', group: 'inline', inline: true, atom: true,
    addAttributes() { return Object.fromEntries(externalVideoKeys.map(key => [key, { default: null }])); },
    parseHTML() { return [{ tag: 'iframe[src]', getAttrs: element => isMixedVideo(element) ? videoFromElement(element) : false }]; },
    renderHTML({ node }) { return ['iframe', videoFrameAttributes(Object.fromEntries(Object.entries(node.attrs).filter(([, value]) => value !== null)))]; },
  }),
  Mark.create({
    name: 'legacyTextStyle',
    addAttributes() { return Object.fromEntries(legacyStyleKeys.map(key => [key, { default: null }])); },
    parseHTML() { return ['span[style]', 'strong[style]', 'b[style]'].map(tag => ({ tag, consuming: false, getAttrs: element => element.hasAttribute('data-paf-node') ? false : legacyStyleFromElement(element) })); },
    renderHTML({ mark }) { return ['span', legacyStyleHtml(Object.fromEntries(Object.entries(mark.attrs).filter(([, value]) => value !== null))), 0]; },
  }),
  Node.create({
    name: 'externalVideo',
    group: 'block',
    atom: true,
    addAttributes() {
      return Object.fromEntries(externalVideoKeys.map((key) => [key, { default: null }]));
    },
    parseHTML() {
      return [
        {
          tag: 'iframe[src]',
          getAttrs: (element) => {
            try {
              return isMixedVideo(element) ? false : videoFromElement(element);
            } catch {
              return false;
            }
          },
        },
      ];
    },
    renderHTML({ node }) {
      return [
        'iframe',
        videoFrameAttributes(
          Object.fromEntries(Object.entries(node.attrs).filter(([, value]) => value !== null)),
        ),
      ];
    },
  }),
  Node.create({
    name: 'wordBreak',
    group: 'inline',
    inline: true,
    selectable: false,
    parseHTML() {
      return [{ tag: 'wbr' }];
    },
    renderHTML() {
      return ['wbr'];
    },
    renderText() {
      return '';
    },
  }),
  StarterKit.configure({
    heading: { levels: [2, 3, 4] },
    codeBlock: false,
    trailingNode: false,
    link: { HTMLAttributes: { target: '_self' } },
  }),
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
ajv.addSchema(JSON.parse(await readFile(resolve(root, 'packages/content-schema/schemas/content/event-text.schema.json'))));
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
    imageTypes.includes(n.type) ? imageKeys : n.type === 'assetLink' ? assetLinkKeys : preservedTypes.includes(n.type) ? [...semanticKeys, ...legacyStyleKeys, ...(n.type === 'preservedInline' ? ['ariaLabel'] : [])] : n.type === 'paragraph' ? semanticKeys : n.type === 'legacyTextStyle' ? legacyStyleKeys : ['externalVideo', 'inlineExternalVideo'].includes(n.type)
      ? externalVideoKeys
      : n.type === 'link'
        ? ['href', 'target', 'title', 'legacyBoundary']
        : n.type === 'heading'
          ? ['level', ...semanticKeys]
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
export function convertBody(html, field = 'content', { normalizeLegacyNewTarget = false, preserveLegacyContainers = false, archiveLegacyAttributes = false, dedupeLegacyAnchor = false, mediaResolver, legacyId } = {}) {
  if (typeof html !== 'string') return { issues: [fail('invalid_text', field, typeof html)] };
  const document = new dom.window.DOMParser().parseFromString(html, 'text/html');
  const transformations = [];
  if (normalizeLegacyNewTarget) {
    for (const anchor of document.querySelectorAll('a[target="_NEW"]')) {
      if (anchor.getAttribute('href') !== normalizeLegacyNewTarget) continue;
      transformations.push({ field, attribute: 'target', from: '_NEW', to: '_blank', href: anchor.getAttribute('href'), reason: '#491 user-approved 2026-11-25' });
      anchor.setAttribute('target', '_blank');
    }
  }
  if (dedupeLegacyAnchor) {
    const anchors = [...document.querySelectorAll('[id]')].filter(el => el.id === 'fbPhotoSnowliftCaption');
    for (const anchor of anchors.slice(1)) { transformations.push({ field, attribute: 'id', from: anchor.id, to: null, reason: '#490 article 10297 user-approved 2026-11-25; first anchor retained' }); anchor.removeAttribute('id'); }
  }
  const issues = [],
    references = [];
  if (mediaResolver) {
    try { rewriteBodyMedia(document, mediaResolver, legacyId, field, transformations, references); } catch (error) { return { issues: [fail(error.message, field, 'media mapping failed')], references, transformations }; }
  }
  const allowed = new Set(
    'span iframe p br wbr strong b em i u s strike a blockquote hr h2 h3 h4 ul ol li'.split(' '),
  );
  if (preserveLegacyContainers) allowed.add('div');
  if (mediaResolver) allowed.add('img');
  // Inspect head too: parseFromString can move unsupported source elements there.
  for (const [elementIndex, el] of [...document.querySelectorAll('*')].entries()) {
    const tag = el.localName;
    if (['html', 'head', 'body'].includes(tag)) {
      if (el.attributes.length) issues.push(fail('unsupported_attributes', field, tag));
      continue;
    }
    if (!allowed.has(tag) || (tag === 'span' && !preserveLegacyContainers && !el.hasAttribute('style')))
      issues.push(
        fail(
          ['img', 'iframe'].includes(tag) ? 'unresolved_asset_or_embed' : 'unsupported_element',
          field,
          tag,
        ),
      );
    for (const attr of [...el.attributes]) {
      if (archiveLegacyAttributes && ['p', 'span', 'div', 'a'].includes(tag) && ['class', 'data-saferedirecturl', 'data-lynx-mode', 'data-lynx-uri', 'data-ft', 'data-tooltip', 'tabindex', 'aria-live', 'data-aria-label-part', 'data-testid'].includes(attr.name)) {
        transformations.push({ field, elementIndex, tag, attribute: attr.name, from: attr.value, to: 'source.raw', reason: '#490 user-approved 2026-11-25; not applied to public HTML' });
        el.removeAttribute(attr.name); continue;
      }
      if (['href', 'src'].includes(attr.name))
        references.push({ field, tag, attribute: attr.name, url: attr.value });
      if (
        !(preserveLegacyContainers && ['p', 'h2', 'h3', 'h4', 'span', 'div'].includes(tag) && ['id', 'lang', 'dir'].includes(attr.name)) &&
        !(mediaResolver && ['img','a'].includes(tag) && attr.name === 'data-paf-asset') &&
        !(mediaResolver && tag === 'img' && ['src','alt','title','width','height','class','loading','decoding','srcset','sizes'].includes(attr.name)) &&
        !(preserveLegacyContainers && tag === 'span' && attr.name === 'aria-label' && el.children.length === 0 && el.textContent === '#' && attr.value.length > 0 && attr.value.length <= 2000) &&
        !(tag === 'a' && ['href', 'target', 'rel', 'title'].includes(attr.name)) &&
        !(tag === 'ol' && attr.name === 'start') &&
        !(['span', 'strong', 'b'].includes(tag) && attr.name === 'style') &&
        !(
          tag === 'iframe' &&
          ['src', 'title', 'width', 'height', 'frameborder', 'allowfullscreen', 'loading'].includes(attr.name)
        )
      )
        issues.push(fail('unsupported_attribute', field, `${tag}.${attr.name}`));
    }
    if (el.hasAttribute('style') && ['span', 'strong', 'b'].includes(tag)) {
      try {
        const attrs = legacyStyleFromElement(el);
        const corrected = legacyColorCorrections[attrs.color];
        if (corrected) {
          transformations.push({ field, elementIndex, tag, attribute: 'style.color', from: attrs.color, to: corrected, reason: '#490 user-approved 2026-11-25; source.raw backup unchanged, stored and displayed color corrected' });
          el.setAttribute('style', legacyStyleHtml({ ...attrs, color: corrected }).style);
        }
      } catch (error) { issues.push(fail('unsupported_legacy_style', field, error.message)); }
    }
    if (preserveLegacyContainers && ['p', 'h2', 'h3', 'h4', 'span', 'div'].includes(tag)) {
      try { legacyAttrs(el); } catch (error) { issues.push(fail('invalid_legacy_semantics', field, error.message)); }
    }
    if (tag === 'iframe') {
      try {
        videoFromElement(el);
        if (
          el.innerHTML.trim() ||
          (el.hasAttribute('frameborder') && el.getAttribute('frameborder') !== '0') ||
          (el.hasAttribute('allowfullscreen') &&
            !['', 'true', 'allowfullscreen'].includes(el.getAttribute('allowfullscreen')))
        )
          throw Error('unsupported_video_attributes');
      } catch (error) {
        issues.push(fail('invalid_video', field, error.message));
      }
    }
    if (tag === 'a' && (!validUrl(el.getAttribute('href') ?? '') || (!el.textContent && !el.querySelector('img[data-paf-asset]'))))
      issues.push(fail('unsupported_link', field, el.getAttribute('href')));
    if (tag === 'a' && isOwnAttachment(el.getAttribute('href') ?? ''))
      issues.push(fail('unresolved_attachment_link', field, el.getAttribute('href')));
    if (tag === 'ol' && el.hasAttribute('start') && !/^[1-9]\d*$/.test(el.getAttribute('start')))
      issues.push(fail('invalid_list_start', field, el.getAttribute('start')));
  }
  if (issues.length) return { issues, references, transformations };
  const previous = { window: globalThis.window, document: globalThis.document };
  const previousMediaPath = mediaPath;
  if (mediaResolver) mediaPath = mediaResolver.path;
  try {
    globalThis.window = dom.window;
    globalThis.document = dom.window.document;
    // Lift a video-only paragraph before parsing a block video, avoiding an invented empty paragraph.
    // Work on a copy; the source DOM and preserved raw HTML remain unchanged.
    const editable = document.body.cloneNode(true);
    for (const [index, anchor] of [...editable.querySelectorAll('a')].entries()) {
      const neighbor = direction => { let node = anchor[direction]; while(node?.nodeType===3 && !node.textContent.trim()) node=node[direction]; return node?.nodeType===1 && node.localName==='a'; };
      if (!neighbor('previousSibling') && !neighbor('nextSibling')) continue;
      anchor.setAttribute('data-paf-boundary', String(index));
      if (anchor.hasAttribute('data-paf-asset')) { const attrs=JSON.parse(anchor.getAttribute('data-paf-asset')); attrs.legacyBoundary=index; anchor.setAttribute('data-paf-asset',JSON.stringify(attrs)); }
    }
    for (const frame of editable.querySelectorAll('p > iframe'))
      if (!isMixedVideo(frame)) frame.parentElement.replaceWith(frame);
    if (preserveLegacyContainers) {
      for (const strong of [...editable.querySelectorAll('strong')].filter(el=>el.querySelector('a'))) strong.setAttribute('data-paf-node','preservedStrong');
      for (const el of editable.querySelectorAll('span,div')) {
        const hasBlocks = [...el.children].some(child => ['div','p','h2','h3','h4','blockquote','ul','ol','hr','iframe'].includes(child.localName));
        if (el.localName === 'div' && hasBlocks && [...el.childNodes].some(child => child.nodeType === 3 && child.textContent.trim())) throw Error('mixed_legacy_container');
        el.setAttribute('data-paf-node', el.localName === 'span' ? 'preservedInline' : hasBlocks ? 'preservedBlock' : 'preservedTextBlock');
      }
    }
    const doc = stored(generateJSON(editable.innerHTML, extensions));
    pm.nodeFromJSON(doc).check();
    if (!validBodyAnchors(doc)) throw Error('duplicate_or_reserved_anchor');
    const rendered = generateHTML(doc, extensions);
    const roundtrip = stored(generateJSON(rendered, extensions));
    if (JSON.stringify(doc) !== JSON.stringify(roundtrip)) throw Error('roundtrip_changed');
    const normalize = (element) => {
      function walk(node) {
        if (node.nodeType === 3) return node.textContent;
        if (node.nodeType !== 1) return '';
        if (node.localName === 'img') return `\u0000image:${JSON.stringify(Object.entries(JSON.parse(node.getAttribute('data-paf-asset'))).sort())}\u0000`;
        if (node.localName === 'br') return '\n';
        if (node.localName === 'iframe')
          return `\n\u0000video:${JSON.stringify(videoFromElement(node))}\u0000\n`;
        if (node.localName === 'wbr') return '\u0000wbr\u0000';
        const text = [...node.childNodes].map(walk).join('');
        return ['div', 'p', 'blockquote', 'h2', 'h3', 'h4', 'li', 'ul', 'ol'].includes(node.localName)
          ? `\n${text}\n`
          : text;
      }
      return walk(element).replace(/\s+/g, ' ').trim();
    };
    const output = new dom.window.DOMParser().parseFromString(rendered, 'text/html');
    if (normalize(document.body) !== normalize(output.body)) throw Error('text_changed');
    function styledCharacters(body) {
      const result = [];
      function visit(node, inherited = {}) {
        if (node.nodeType === 3) {
          for (const character of node.textContent) if (!/\s/.test(character)) result.push([character, Object.entries(inherited).sort()]);
        } else if (node.nodeType === 1) {
          const attrs = node.hasAttribute('style') ? { ...inherited, ...legacyStyleFromElement(node) } : inherited;
          for (const child of node.childNodes) visit(child, attrs);
        }
      }
      visit(body); return result;
    }
    const labels = d => [...d.querySelectorAll('span[aria-label]')].map(el=>({label:el.getAttribute('aria-label'),text:el.textContent}));
    if (JSON.stringify(labels(document)) !== JSON.stringify(labels(output))) throw Error('accessible_label_changed');
    if (JSON.stringify(styledCharacters(document.body)) !== JSON.stringify(styledCharacters(output.body))) throw Error('style_changed');
    if (preserveLegacyContainers) {
      const semantics = d => [...d.body.querySelectorAll('[id],[lang],[dir]')].map(el => ({ tag: el.localName, attrs: Object.fromEntries(['id','lang','dir'].filter(key => el.hasAttribute(key)).map(key => [key, el.getAttribute(key)])), text: normalize(el) }));
      if (JSON.stringify(semantics(document)) !== JSON.stringify(semantics(output))) throw Error('semantics_changed');
      for (const tag of ['span', 'div']) {
        const count = output.querySelectorAll(tag === 'span' ? '[data-paf-node="preservedInline"]' : '[data-paf-node="preservedBlock"],[data-paf-node="preservedTextBlock"]').length;
        if (document.body.querySelectorAll(tag).length !== count) throw Error('container_changed');
      }
    }
    const links = (d) =>
      [...d.body.querySelectorAll('a')].map((a) => ({
        href: a.hasAttribute('data-paf-asset') ? JSON.parse(a.getAttribute('data-paf-asset')).assetId : a.getAttribute('href'),
        target: a.getAttribute('target') || '_self',
        title: a.getAttribute('title'),
        text: normalize(a),
      }));
    if (JSON.stringify(links(document)) !== JSON.stringify(links(output)))
      throw Error('link_changed');
    // Do not silently lose links, breaks or supported formatting during parsing.
    const counts = (d) =>
      [
        'a',
        'img',
        'br',
        'wbr',
        'iframe',
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
    return { body, issues: [], references, transformations };
  } catch (error) {
    return { issues: [fail('body_conversion_failed', field, error.message)], references, transformations };
  } finally {
    mediaPath = previousMediaPath;
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete globalThis[key];
      else globalThis[key] = value;
    }
  }
}
function plain(html, field, issues, references, transformations, legacyId) {
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
    const result = convertBody(html, field, { normalizeLegacyNewTarget: field === 'appendix_contents' ? ({ 3944: 'http://www.videoact.jp/', 3945: 'http://www.yunfest.org/' }[legacyId] ?? false) : false });
    references.push(...(result.references ?? []));
    transformations.push(...(result.transformations ?? []));
    issues.push(...result.issues);
    return result.body ?? '';
  }
  for (const br of d.body.querySelectorAll('br')) br.replaceWith('\n');
  for (const p of d.body.querySelectorAll('p')) p.append('\n');
  return d.body.textContent.trim();
}
export function prepare(snapshot, sourceHash, { emptyDraftSlugIds = new Set(), mediaResolver } = {}) {
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
        transformations = [],
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
        const result = convertBody(raw[k], k, { preserveLegacyContainers: true, archiveLegacyAttributes: true, dedupeLegacyAnchor: group === 'blogs' && raw.id === 10297, mediaResolver, legacyId: raw.id });
        transformations.push(...(result.transformations ?? []));
        issues.push(...result.issues);
        references.push(...(result.references ?? []));
        return result.body ?? emptyBody();
      }
      let slug;
      if (group === 'blogs') {
        try {
          slug = decodeURIComponent(text('name'));
          if ((!slug && !emptyDraftSlugIds.has(raw.id)) || /[\s/\\?#\u0000-\u001f]/.test(slug) || slug === '.' || slug === '..')
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
          timeDescription: plain(raw.dates_details, 'dates_details', issues, references, transformations, raw.id),
          venue: text('place'),
          address: text('address'),
          mapUrl: text('map'),
          access: plain(raw.access_details, 'access_details', issues, references, transformations, raw.id),
          venueNotes: '',
          fee: plain(raw.fee_details, 'fee_details', issues, references, transformations, raw.id),
          organizer: plain(raw.host_details, 'host_details', issues, references, transformations, raw.id),
          notes: plain(raw.appendix_contents, 'appendix_contents', issues, references, transformations, raw.id),
          multiDay: raw.date_from !== raw.date_to && raw.date_to !== '',
          formats: ['unknown'],
          status: { '': 'normal', 1: 'postponed', 2: 'cancelled' }[raw.status],
          filmTagIds: draft.filmTagIds,
          eventTagIds: terms('event_tags', 'event'),
        };
        // #491: explicitly preserve unknown attendance; never infer offline from venue/title.
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
          try {
            if (!mediaResolver) throw Error('unresolved_attachment');
            const e = mediaResolver.resolve(raw.media_pdf_url, raw.id);
            if (e.kind !== 'document' || e.disposition === 'excluded') throw Error('invalid_document_reference');
            draft.attachmentAssetIds.push(e.assetId);
            transformations.push({field:'media_pdf_url',from:raw.media_pdf_url,to:e.assetId,reason:'registered-attachment-field'});
          } catch { issues.push(fail('unresolved_attachment', 'media_pdf_url', raw.media_pdf_url)); }
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
        transformations,
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
