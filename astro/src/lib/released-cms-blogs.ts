import {
  semanticKeys,
  preservedTypes,
  semanticHtml,
  containerHtml,
  validBodyAnchors,
} from '../../../packages/content-schema/legacy-containers';
import { legacyStyleHtml } from '../../../packages/content-schema/legacy-text-style';
import {
  videoFrameAttributes,
  validExternalVideo,
} from '../../../packages/content-schema/external-video';
import { readFile } from 'node:fs/promises';
import { validLink, type BlogDraft } from '../../../cms/src/features/blog/draft';
import snapshot from '../../data/wordpress-export.json' with { type: 'json' };

type Node = {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  content?: Node[];
  marks?: Node[];
};
type Entry = {
  path: string;
  legacy?: { id: number; slug: string; publishedAt: string };
  publishedAt: string;
  content: BlogDraft & { slug: string };
};
const escape = (text: unknown) =>
  (typeof text === 'string' ? text : '').replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ??
      character,
  );
const blocks = new Map(
  Object.entries({
    paragraph: 'p',
    bulletList: 'ul',
    orderedList: 'ol',
    listItem: 'li',
    blockquote: 'blockquote',
    bold: 'strong',
    italic: 'em',
    strike: 's',
    code: 'code',
    codeBlock: 'pre',
    underline: 'u',
  }),
);
export function createBodyRenderer(
  assetPath: (id: unknown) => string = () => {
    throw new Error('unexpected_body_asset');
  },
) {
  function renderMarks(value: string, marks: Node[]): string {
    return marks.reduce((value, mark) => {
      if (mark.type === 'legacyTextStyle')
        return `<span style="${escape(legacyStyleHtml(mark.attrs ?? {}).style)}">${value}</span>`;
      if (mark.type === 'assetLink')
        return `<a href="${escape(assetPath(mark.attrs?.assetId))}">${value}</a>`;
      if (mark.type === 'link') {
        const { href, target, title } = mark.attrs ?? {};
        if (
          typeof href !== 'string' ||
          !validLink(href) ||
          (target !== undefined && target !== '_self' && target !== '_blank') ||
          (title !== undefined && typeof title !== 'string')
        )
          throw new Error('invalid_blog_release_link');
        const targetAttr = target === undefined ? '' : ` target="${target}"`;
        const rel = target === '_blank' ? ' rel="noopener noreferrer"' : '';
        const titleAttr = title === undefined ? '' : ` title="${escape(title)}"`;
        return `<a href="${escape(href)}"${targetAttr}${rel}${titleAttr}>${value}</a>`;
      }
      const tag = blocks.get(mark.type);
      return tag ? `<${tag}>${value}</${tag}>` : value;
    }, value);
  }
  function render(node: Node): string {
    if (node.type === 'doc' && !validBodyAnchors(node)) throw Error('duplicate_or_reserved_anchor');
    if (['externalVideo', 'inlineExternalVideo'].includes(node.type)) {
      if (!validExternalVideo(node.attrs)) throw new Error('invalid_blog_release_video');
      const attrs = videoFrameAttributes(node.attrs, true);
      const width = node.attrs.width ?? 560,
        height = node.attrs.height ?? 315;
      const htmlAttrs = Object.entries(attrs)
        .map(([key, value]) => `${key}="${escape(String(value))}"`)
        .join(' ');
      const wrapper = node.type === 'inlineExternalVideo' ? 'span' : 'div';
      const display = node.type === 'inlineExternalVideo' ? 'display:inline-block;' : '';
      return `<${wrapper} style="${display}width:${String(width)}px;max-width:100%;aspect-ratio:${String(width)}/${String(height)}"><iframe ${htmlAttrs} loading="lazy" referrerpolicy="strict-origin-when-cross-origin" style="width:100%;height:100%"></iframe></${wrapper}>`;
    }
    if (node.type === 'assetImage')
      return `<img src="${escape(assetPath(node.attrs?.assetId))}" alt="${escape(node.attrs?.alt)}">`;
    if (node.type === 'hardBreak') return '<br>';
    if (node.type === 'wordBreak') return '<wbr>';
    if (node.type === 'horizontalRule') return '<hr>';
    if (node.type === 'text') return renderMarks(escape(node.text), node.marks ?? []);
    const level = Number(node.attrs?.level);
    if (preservedTypes.includes(node.type)) {
      const tag = node.type === 'preservedInline' ? 'span' : 'div';
      const attrs = Object.entries(containerHtml(node.attrs ?? {}))
        .map(([key, value]) => ` ${key}="${escape(value)}"`)
        .join('');
      return renderMarks(
        `<${tag}${attrs}>${(node.content ?? []).map(render).join('')}</${tag}>`,
        node.marks ?? [],
      );
    }
    const tag =
      node.type === 'heading'
        ? [2, 3, 4, 5, 6].includes(level)
          ? `h${String(level)}`
          : 'h2'
        : blocks.get(node.type);
    const value = (node.content ?? []).map(render).join('');
    const start = Number(node.attrs?.start);
    const attribute =
      node.type === 'orderedList' && Number.isSafeInteger(start) && start > 1
        ? ` start="${String(start)}"`
        : '';
    const semantics = ['paragraph', 'heading'].includes(node.type)
      ? Object.entries(
          semanticHtml(
            Object.fromEntries(
              Object.entries(node.attrs ?? {}).filter(([key]) => semanticKeys.includes(key)),
            ),
          ),
        )
          .map(([key, value]) => ` ${key}="${escape(value)}"`)
          .join('')
      : '';
    return tag ? `<${tag}${attribute}${semantics}>${value}</${tag}>` : value;
  }
  return render;
}
export async function readCmsRelease() {
  const file = process.env.CMS_BLOG_RELEASE_SNAPSHOT;
  if (!file)
    return {
      blogs: [],
      articles: [],
      render: (): string => '',
      assetPath: (): string => {
        throw new Error('missing_release');
      },
    };
  const {
    blogs,
    articles = [],
    assets,
  } = JSON.parse(await readFile(file, 'utf8')) as {
    blogs: Entry[];
    articles?: import('./released-cms-articles').ArticleEntry[];
    assets: { id: string; extension: string }[];
  };
  const files = new Map(
    assets.map((asset) => [asset.id, `/__cms-media/${asset.id}.${asset.extension}`]),
  );
  function assetPath(id: unknown) {
    const path = typeof id === 'string' ? files.get(id) : undefined;
    if (!path) throw new Error('missing_blog_release_asset');
    return path;
  }
  const render = createBodyRenderer(assetPath);
  return { blogs, articles, render, assetPath };
}
export async function releasedCmsBlogs() {
  const { blogs, render } = await readCmsRelease();
  const categories = new Map(
    snapshot.content.blogs.flatMap((post) =>
      post.categories.map((tag) => [String(tag.term_id), tag.name] as const),
    ),
  );
  const films = new Map(
    snapshot.content.blogs.flatMap((post) =>
      Array.isArray(post.film_tags)
        ? post.film_tags.map((tag) => [String(tag.term_id), tag.name] as const)
        : [],
    ),
  );
  const seen = new Set<number>();
  for (const blog of blogs) {
    if (!blog.legacy) continue;
    const source = snapshot.content.blogs.find((post) => post.id === blog.legacy?.id);
    if (
      !source ||
      decodeURIComponent(source.name) !== blog.legacy.slug ||
      source.published !== blog.legacy.publishedAt ||
      blog.publishedAt !== source.published ||
      seen.has(source.id)
    )
      throw new Error('invalid_legacy_blog_release');
    seen.add(source.id);
  }
  return blogs.map(({ content, publishedAt, legacy }) => ({
    legacySourceId: legacy?.id,
    id: `cms:${content.slug}`,
    name: content.slug,
    cmsSlug: content.slug,
    published: publishedAt,
    thumbnail: false as const,
    categories: content.categoryId
      ? [{ name: categories.get(content.categoryId) ?? content.categoryId }]
      : [],
    film_tags: content.filmTagIds.map((id) => ({ name: films.get(id) ?? id })),
    isWorkshopReport: content.isWorkshopReport,
    slug: content.slug,
    content: render(content.body.doc),
    title: content.title,
    publishedAt,
    isRecommended: content.isRecommended,
  }));
}
