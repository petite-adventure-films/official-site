import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, test, vi } from 'vitest';
import { releasedCmsBlogs } from './released-cms-blogs';
import { emptyBlogDraft } from '../../../cms/src/features/blog/draft';
import snapshot from '../../data/wordpress-export.json';
let directory: string | undefined;
afterEach(async () => {
  vi.unstubAllEnvs();
  if (directory) await rm(directory, { recursive: true, force: true });
});
async function release(overrides = {}, duplicate = false) {
  const source = snapshot.content.blogs.find((post) => post.id === 18053);
  if (!source) throw new Error('missing_fixture');
  const entry = {
    path: '/moved/',
    publishedAt: source.published,
    content: { ...emptyBlogDraft(), slug: 'moved', title: source.title, categoryId: '2879' },
    legacy: { id: source.id, slug: source.name, publishedAt: source.published, ...overrides },
  };
  directory = await mkdtemp(join(tmpdir(), 'paf-legacy-render-'));
  const file = join(directory, 'blogs.json');
  await writeFile(
    file,
    JSON.stringify({ blogs: duplicate ? [entry, entry] : [entry], assets: [] }),
  );
  vi.stubEnv('CMS_BLOG_RELEASE_SNAPSHOT', file);
}
test('a verified legacy source can use a new canonical URL while keeping its old date', async () => {
  await release();
  expect(await releasedCmsBlogs()).toMatchObject([
    { slug: 'moved', legacySourceId: 18053, published: '2026/07/02' },
  ]);
});
test.each([{ id: 999999 }, { slug: 'unrelated' }, { publishedAt: '2026/11/22' }])(
  'rejects a mismatched legacy claim %j',
  async (bad) => {
    await release(bad);
    await expect(releasedCmsBlogs()).rejects.toThrow('invalid_legacy_blog_release');
  },
);
test('rejects two released articles claiming the same legacy source', async () => {
  await release({}, true);
  await expect(releasedCmsBlogs()).rejects.toThrow('invalid_legacy_blog_release');
});

test('renders discretionary breaks in place without inserting forced breaks or spaces', async () => {
  await release();
  const { readCmsRelease } = await import('./released-cms-blogs');
  const { render } = await readCmsRelease();
  expect(
    render({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'before' },
            { type: 'wordBreak' },
            { type: 'text', text: 'after' },
          ],
        },
      ],
    }),
  ).toBe('<p>before<wbr>after</p>');
});

test('retains link target and title while escaping attributes and adding safe rel', async () => {
  await release();
  const { readCmsRelease } = await import('./released-cms-blogs');
  const { render } = await readCmsRelease();
  const link = (attrs: Record<string, unknown>) =>
    render({ type: 'text', text: '<案内>', marks: [{ type: 'link', attrs }] });
  expect(
    link({ href: 'https://example.com/?a=1&b=2', target: '_blank', title: '資料 "案内"' }),
  ).toBe(
    '<a href="https://example.com/?a=1&amp;b=2" target="_blank" rel="noopener noreferrer" title="資料 &quot;案内&quot;">&lt;案内&gt;</a>',
  );
  expect(link({ href: 'https://example.com/', target: '_self' })).toBe(
    '<a href="https://example.com/" target="_self">&lt;案内&gt;</a>',
  );
  expect(link({ href: 'mailto:info@example.com' })).toBe(
    '<a href="mailto:info@example.com">&lt;案内&gt;</a>',
  );
});

test.each([
  { href: 'javascript:alert(1)' },
  { href: 'https://user:secret@example.com/' },
  { href: 'https://example.com/\n' },
  { href: '/unverified-relative/' },
  { href: 'https://example.com/', target: 'unexpected-window' },
  { href: 'https://example.com/', title: { unsafe: true } },
])(
  'rejects invalid released link attributes instead of silently changing a link: %j',
  async (attrs) => {
    await release();
    const { readCmsRelease } = await import('./released-cms-blogs');
    const { render } = await readCmsRelease();
    expect(() => render({ type: 'text', text: '案内', marks: [{ type: 'link', attrs }] })).toThrow(
      'invalid_blog_release_link',
    );
  },
);

test('emits only allowed link attributes and preserves escaped text and nested formatting', async () => {
  await release();
  const { readCmsRelease } = await import('./released-cms-blogs');
  const { render } = await readCmsRelease();
  expect(
    render({
      type: 'text',
      text: '本文',
      marks: [
        { type: 'bold' },
        {
          type: 'link',
          attrs: {
            href: 'https://example.com/',
            target: '_blank',
            title: '',
            rel: 'opener',
            onclick: 'alert(1)',
            'data-href': 'https://other.example/',
          },
        },
      ],
    }),
  ).toBe(
    '<a href="https://example.com/" target="_blank" rel="noopener noreferrer" title=""><strong>本文</strong></a>',
  );
});

test('blog and the three article types use the same preserved link output', async () => {
  await release();
  const file = process.env.CMS_BLOG_RELEASE_SNAPSHOT;
  if (!file) throw new Error('missing_test_release');
  const data = JSON.parse(await readFile(file, 'utf8')) as {
    blogs: { content: { body: unknown } }[];
    articles: unknown[];
  };
  const body = {
    schemaVersion: 2,
    doc: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: '案内',
              marks: [
                {
                  type: 'link',
                  attrs: { href: 'https://example.com/', target: '_blank', title: '説明' },
                },
              ],
            },
          ],
        },
      ],
    },
  };
  data.blogs[0].content.body = body;
  data.articles = ['news', 'pressCoverage', 'video'].map((type) => ({
    type,
    path: `/${type}/#cms-sample`,
    publishedAt: '2026/11/22',
    content: { ...emptyBlogDraft(), body, articleBody: body },
  }));
  await writeFile(file, JSON.stringify(data));
  const expected =
    '<p><a href="https://example.com/" target="_blank" rel="noopener noreferrer" title="説明">案内</a></p>';
  expect((await releasedCmsBlogs())[0].content).toBe(expected);
  const { releasedCmsArticles } = await import('./released-cms-articles');
  for (const type of ['news', 'pressCoverage', 'video'] as const) {
    const articles = await releasedCmsArticles(type);
    expect(articles[0].content).toBe(expected);
    expect(articles[0].article_contents).toBe(expected);
  }
});
