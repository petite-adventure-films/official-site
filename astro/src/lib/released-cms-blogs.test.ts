import { mkdtemp, writeFile, rm } from 'node:fs/promises';
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
