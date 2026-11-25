import { expect, test } from '@playwright/test';
import { emptyBlogDraft } from '../src/features/blog/draft';

test('legacy containers, styles, language and inline video survive editing and local publication', async ({ page, request, context }) => {
  test.setTimeout(180_000);
  await context.route('https://www.youtube.com/embed/**', route => route.fulfill({ contentType: 'text/html; charset=utf-8', body: '<p>動画テスト応答</p>' }));
  const video = { provider: 'youtube', videoId: 'abcdefghijk', sourceUrl: 'https://www.youtube.com/embed/abcdefghijk', width: 320, height: 180 };
  const doc = { type: 'doc', content: [
    { type: 'preservedBlock', attrs: { dir: 'auto', anchorId: 'old-section' }, content: [
      { type: 'paragraph', attrs: { lang: 'ja-JP' }, content: [
        { type: 'text', text: '元の文章 ' },
        { type: 'preservedInline', attrs: { lang: 'EN-US', color: '#0b75b3', anchorId: 'old-caption' }, marks: [{ type: 'bold' }], content: [{ type: 'text', text: 'English' }] },
      ] },
      { type: 'preservedTextBlock', content: [{ type: 'text', text: '旧書体', marks: [{ type: 'legacyTextStyle', attrs: { fontFamily: 'Times New Roman,serif', color: '#d90000' } }] }] },
    ] },
    { type: 'paragraph', content: [{ type: 'text', text: '動画の前' }, { type: 'inlineExternalVideo', attrs: video }, { type: 'text', text: '動画の後' }] },
    { type: 'paragraph', content: [{ type: 'text', text: '追記位置' }] },
  ] };
  const payload = { ...emptyBlogDraft(), title: '旧書式の保持', slug: `legacy-format-${Date.now()}`, categoryId: '2879', body: { schemaVersion: 2, doc } };
  const response = await request.post('/api/contents', { headers: { Origin: 'http://127.0.0.1:5174' }, data: { type: 'blog', operationId: crypto.randomUUID(), payload } });
  expect(response.status()).toBe(201);
  const saved = await response.json();
  await page.goto(`/cms/blog/${saved.id}/edit`);
  const body = page.getByRole('textbox', { name: '本文', exact: true });
  await expect(body.locator('#old-caption')).toHaveAttribute('lang', 'EN-US');
  await expect(body.locator('#old-caption')).toHaveCSS('color', 'rgb(11, 117, 179)');
  await expect(body.getByText('旧書体', { exact: true })).toHaveCSS('color', 'rgb(217, 0, 0)');
  await expect(body.locator('p iframe')).toHaveCount(1);
  await body.locator('p').last().click(); await page.keyboard.press('End'); await page.keyboard.insertText('に追記');
  await expect(page.getByRole('status')).toHaveText('保存済み');
  await page.reload(); await expect(body).toContainText('追記位置に追記');
  const edited = await (await request.get(`/api/contents/${saved.id}`)).json();
  expect(edited.payload.body.doc.content.slice(0, 2)).toEqual(doc.content.slice(0, 2));
  await page.screenshot({ path: 'test-results/legacy-body-editor.png', fullPage: true });
  await page.getByRole('button', { name: '公開', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: '公開する', exact: true }).click();
  const publicLink = page.getByRole('link', { name: '公開ページを見る', exact: true });
  await expect(publicLink).toBeVisible({ timeout: 90_000 });
  const publicPage = await context.newPage();
  await publicPage.goto((await publicLink.getAttribute('href'))!);
  await expect(publicPage.locator('#old-section')).toHaveAttribute('dir', 'auto');
  await expect(publicPage.locator('#old-caption')).toHaveAttribute('lang', 'EN-US');
  await expect(publicPage.locator('#old-caption')).toHaveCSS('color', 'rgb(11, 117, 179)');
  await expect(publicPage.locator('#old-caption')).toHaveCSS('font-weight', '700');
  await expect(publicPage.getByText('旧書体', { exact: true })).toHaveCSS('color', 'rgb(217, 0, 0)');
  await expect(publicPage.locator('main p iframe')).toHaveCount(1);
  await expect(publicPage.locator('main')).toContainText('動画の前');
  await expect(publicPage.locator('main')).toContainText('動画の後');
  await expect(publicPage.locator('main [data-paf-node]')).toHaveCount(0);
  await publicPage.screenshot({ path: 'test-results/legacy-body-public.png', fullPage: true });
  await publicPage.close();
  await page.getByRole('button', { name: '複製', exact: true }).click();
  await expect(page).not.toHaveURL(new RegExp(saved.id));
  const copyId = page.url().split('/').at(-2)!;
  expect((await (await request.get(`/api/contents/${copyId}`)).json()).payload.body).toEqual(edited.payload.body);
});
