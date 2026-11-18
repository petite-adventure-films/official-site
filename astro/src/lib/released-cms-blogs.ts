import { readFile } from 'node:fs/promises';

type Node = {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  content?: Node[];
  marks?: Node[];
};
type Entry = {
  path: string;
  publishedAt: string;
  content: { slug: string; title: string; isRecommended: boolean; body: { doc: Node } };
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
export async function releasedCmsBlogs() {
  const file = process.env.CMS_BLOG_RELEASE_SNAPSHOT;
  if (!file) return [];
  const { blogs, assets } = JSON.parse(await readFile(file, 'utf8')) as {
    blogs: Entry[];
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
  return blogs.map(({ content, publishedAt }) => ({
    slug: content.slug,
    content: render(content.body.doc),
    title: content.title,
    publishedAt,
    isRecommended: content.isRecommended,
  }));
}
