import { readFile } from 'node:fs/promises';
import type { BlogDraft } from '../../../cms/src/features/blog/draft';
import snapshot from '../../data/wordpress-export.json';

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
  function render(node: Node): string {
    if (node.type === 'assetImage')
      return `<img src="${escape(assetPath(node.attrs?.assetId))}" alt="${escape(node.attrs?.alt)}">`;
    if (node.type === 'hardBreak') return '<br>';
    if (node.type === 'wordBreak') return '<wbr>';
    if (node.type === 'horizontalRule') return '<hr>';
    if (node.type === 'text') {
      return (node.marks ?? []).reduce((value, mark) => {
        if (mark.type === 'assetLink')
          return `<a href="${escape(assetPath(mark.attrs?.assetId))}">${value}</a>`;
        if (
          mark.type === 'link' &&
          /^(https?:\/\/|mailto:)/i.test(
            typeof mark.attrs?.href === 'string' ? mark.attrs.href : '',
          )
        ) {
          return `<a href="${escape(mark.attrs?.href)}">${value}</a>`;
        }
        const tag = blocks.get(mark.type);
        return tag ? `<${tag}>${value}</${tag}>` : value;
      }, escape(node.text));
    }
    const level = Number(node.attrs?.level);
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
    return tag ? `<${tag}${attribute}>${value}</${tag}>` : value;
  }
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
