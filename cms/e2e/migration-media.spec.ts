import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { emptyBlogDraft } from '../src/features/blog/draft';
test('migration inline image, responsive variants and click target survive edit, reload and local release', async ({
  page,
  request,
  context,
}) => {
  test.setTimeout(180_000);
  const origin = 'http://127.0.0.1:5174',
    headers = { Origin: origin };
  const ids = [];
  for (const name of ['sample.png', 'sample.jpg']) {
    const bytes = await readFile(`e2e/fixtures/media/${name}`),
      mimeType = name.endsWith('png') ? 'image/png' : 'image/jpeg';
    const start = await request.post('/api/media/uploads', {
      headers,
      data: {
        operationId: crypto.randomUUID(),
        filename: name,
        mimeType,
        sizeBytes: bytes.length,
        sha256: createHash('sha256').update(bytes).digest('hex'),
      },
    });
    expect(start.status()).toBe(201);
    const { id } = await start.json();
    expect(
      (
        await request.put(`/api/local/media/${id}`, {
          headers: { ...headers, 'Content-Type': mimeType },
          data: bytes,
        })
      ).status(),
    ).toBe(204);
    expect(
      (
        await request.post(`/api/media/${id}/complete`, { headers, data: {} })
      ).status(),
    ).toBe(200);
    ids.push(id);
  }
  const attrs = {
    assetId: ids[0],
    alt: '移行画像',
    title: '画像のtitle',
    width: 160,
    height: 120,
    legacyClass: 'alignnone size-full wp-image-1',
    sources: [{ assetId: ids[1], width: 32 }],
    sizes: '(max-width: 160px) 100vw, 160px',
  };
  const doc = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: '画像の前' },
          {
            type: 'inlineAssetImage',
            attrs,
            marks: [
              {
                type: 'assetLink',
                attrs: {
                  assetId: ids[1],
                  assetKind: 'image',
                  target: '_blank',
                  title: '元画像',
                },
              },
            ],
          },
          { type: 'text', text: '画像の後' },
        ],
      },
      { type: 'paragraph', content: [{ type: 'text', text: '追記位置' }] },
    ],
  };
  const payload = {
    ...emptyBlogDraft(),
    title: '移行画像の往復検証',
    slug: `migration-image-${Date.now()}`,
    categoryId: '2879',
    body: { schemaVersion: 2, doc },
  };
  const savedResponse = await request.post('/api/contents', {
    headers,
    data: { operationId: crypto.randomUUID(), type: 'blog', payload },
  });
  expect(savedResponse.status()).toBe(201);
  const saved = await savedResponse.json();
  await page.goto(`/cms/blog/${saved.id}/edit`);
  const body = page.getByRole('textbox', { name: '本文', exact: true }),
    img = body.locator('p img');
  await expect(img).toHaveCSS('display', 'inline');
  await expect(img).toHaveAttribute('width', '160');
  await expect(img).toHaveCSS('width', '160px');
  await expect(img).toHaveAttribute('srcset', `/api/media/${ids[1]}/file 32w`);
  await img.click();
  await page.getByRole('button', { name: '画像', exact: true }).click();
  await page
    .getByRole('textbox', { name: '代替テキスト', exact: true })
    .fill('更新した移行画像');
  await page.getByRole('button', { name: '適用', exact: true }).click();
  await body.locator('p').last().click();
  await page.keyboard.press('End');
  await page.keyboard.insertText('に追記');
  await expect(page.getByRole('status')).toHaveText('保存済み');
  await page.reload();
  await expect(img).toHaveAttribute('alt', '更新した移行画像');
  const edited = await (await request.get(`/api/contents/${saved.id}`)).json();
  expect(edited.payload.body.doc.content[0].content[1]).toEqual({
    ...doc.content[0].content![1],
    attrs: { ...attrs, alt: '更新した移行画像' },
  });
  await page.screenshot({
    path: 'test-results/migration-media-editor.png',
    fullPage: true,
  });
  await page.getByRole('button', { name: '公開', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: '公開する', exact: true })
    .click();
  const link = page.getByRole('link', {
    name: '公開ページを見る',
    exact: true,
  });
  await expect(link).toBeVisible({ timeout: 90_000 });
  const publicPage = await context.newPage();
  await publicPage.goto((await link.getAttribute('href'))!);
  const publicImage = publicPage.locator('main p img');
  await expect(publicImage).toHaveCSS('display', 'inline');
  await expect(publicImage).toHaveAttribute('title', '画像のtitle');
  await expect(publicImage).toHaveAttribute('width', '160');
  await expect(publicImage).toHaveCSS('width', '160px');
  await expect(publicImage).toHaveAttribute(
    'srcset',
    `/__cms-media/${ids[1]}.jpg 32w`,
  );
  await expect(publicImage.locator('..')).toHaveAttribute(
    'href',
    `/__cms-media/${ids[1]}.jpg`,
  );
  await expect(publicImage.locator('..')).toHaveAttribute('target', '_blank');
  await expect
    .poll(() =>
      publicImage.evaluate(
        (el: HTMLImageElement) => el.complete && el.naturalWidth > 0,
      ),
    )
    .toBe(true);
  await publicPage.screenshot({
    path: 'test-results/migration-media-public.png',
    fullPage: true,
  });
  await publicPage.close();
});
