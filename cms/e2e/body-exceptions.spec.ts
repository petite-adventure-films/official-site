import { expect, test } from '@playwright/test';
import { emptyBlogDraft } from '../src/features/blog/draft';
test('preserves strong/link boundaries, named symbol and loading across edit and local release', async ({
  page,
  request,
  context,
}) => {
  test.setTimeout(180000);
  await context.route('https://www.youtube.com/embed/**', (route) =>
    route.fulfill({
      contentType: 'text/html; charset=utf-8',
      body: '<p>動画テスト</p>',
    }),
  );
  const link = (text: string, legacyBoundary: number) => ({
    type: 'text',
    text,
    marks: [
      {
        type: 'link',
        attrs: {
          href: 'https://example.org/',
          target: '_self',
          legacyBoundary,
        },
      },
    ],
  });
  const doc = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'preservedStrong',
            content: [
              { type: 'text', text: '太字の前' },
              {
                type: 'text',
                text: 'リンク',
                marks: [
                  {
                    type: 'link',
                    attrs: { href: 'https://example.org/', target: '_self' },
                  },
                ],
              },
              { type: 'text', text: '太字の後' },
            ],
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          link('一つ目', 1),
          link('二つ目', 2),
          {
            type: 'preservedInline',
            attrs: { ariaLabel: '記号の説明' },
            content: [{ type: 'text', text: '#' }],
          },
        ],
      },
      {
        type: 'externalVideo',
        attrs: {
          provider: 'youtube',
          videoId: 'abcdefghijk',
          sourceUrl: 'https://www.youtube.com/embed/abcdefghijk',
          loading: 'eager',
          width: 320,
          height: 180,
        },
      },
      { type: 'paragraph', content: [{ type: 'text', text: '追記位置' }] },
    ],
  };
  const payload = {
    ...emptyBlogDraft(),
    title: '本文例外の往復確認',
    slug: `body-exceptions-${Date.now()}`,
    categoryId: '2879',
    body: { schemaVersion: 2, doc },
  };
  const response = await request.post('/api/contents', {
    headers: { Origin: 'http://127.0.0.1:5174' },
    data: { type: 'blog', operationId: crypto.randomUUID(), payload },
  });
  expect(response.status()).toBe(201);
  const { id } = await response.json();
  await page.goto(`/cms/blog/${id}/edit`);
  const body = page.getByRole('textbox', { name: '本文', exact: true });
  await expect(body.locator('strong')).toHaveCount(1);
  await expect(body.locator('strong a')).toHaveCount(1);
  await expect(body.locator('a')).toHaveCount(3);
  await expect(body.getByRole('img', { name: '記号の説明' })).toHaveText('#');
  await expect(body.locator('iframe')).toHaveAttribute('loading', 'eager');
  await body.locator('p').last().click();
  await page.keyboard.press('End');
  await page.keyboard.insertText('へ追記');
  await expect(page.getByRole('status')).toHaveText('保存済み');
  await page.reload();
  await expect(body).toContainText('追記位置へ追記');
  const edited = await (await request.get(`/api/contents/${id}`)).json();
  expect(edited.payload.body.doc.content.slice(0, 3)).toEqual(
    doc.content.slice(0, 3),
  );
  await page.screenshot({
    path: 'test-results/body-exceptions-editor.png',
    fullPage: true,
  });
  await page.getByRole('button', { name: '公開', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: '公開する', exact: true })
    .click();
  const publicLink = page.getByRole('link', {
    name: '公開ページを見る',
    exact: true,
  });
  await expect(publicLink).toBeVisible({ timeout: 90000 });
  const publicPage = await context.newPage();
  await publicPage.goto((await publicLink.getAttribute('href'))!);
  await expect(publicPage.locator('main strong')).toHaveCount(1);
  await expect(publicPage.locator('main strong a')).toHaveCount(1);
  await expect(
    publicPage.locator('main a[href="https://example.org/"]'),
  ).toHaveCount(3);
  await expect(publicPage.getByRole('img', { name: '記号の説明' })).toHaveText(
    '#',
  );
  await expect(publicPage.locator('main iframe')).toHaveAttribute(
    'loading',
    'eager',
  );
  await expect(publicPage.locator('main [data-paf-boundary]')).toHaveCount(0);
  await publicPage.screenshot({
    path: 'test-results/body-exceptions-public.png',
    fullPage: true,
  });
  await publicPage.close();
});
