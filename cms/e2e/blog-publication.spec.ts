import { expect, test } from '@playwright/test';

test('published blog joins category, recommended and workshop archives with its film tags', async ({
  page,
  request,
}) => {
  test.setTimeout(180_000);
  const title = `ブログ一覧接続 ${Date.now()}`;
  await page.goto('/cms/blog/new');
  await page
    .getByRole('textbox', { name: 'タイトル', exact: true })
    .fill(title);
  await page
    .getByRole('textbox', { name: '本文', exact: true })
    .fill('一覧と分類の公開確認');
  await page.getByRole('button', { name: '雑木林コラム', exact: true }).click();
  await page.getByRole('switch', { name: 'おすすめ', exact: true }).check();
  await page
    .getByRole('switch', { name: 'ワークショップ報告', exact: true })
    .check();
  await page.getByRole('button', { name: 'インド日記', exact: true }).click();
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('保存済み');
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
  const url = (await link.getAttribute('href'))!;
  const path = new URL(url).pathname;
  const publicPage = await page.context().newPage();
  for (const archive of [
    '/blog/',
    '/blog/recommended/',
    '/blog/雑木林コラム/',
    '/blog/tag/映像ワークショップレポート/',
    '/workshop/',
  ]) {
    await publicPage.goto(new URL(archive, url).href);
    const card = publicPage
      .locator(`a[href="${path}"]`)
      .filter({ hasText: title });
    await expect(card).toHaveCount(1);
    await expect(card).toContainText('雑木林コラム');
    await expect(card).toContainText('インド日記');
  }
  await publicPage.goto(url);
  await expect(publicPage.locator('main')).toContainText('雑木林コラム');
  await expect(publicPage.locator('main')).toContainText('インド日記');
  await publicPage.screenshot({
    path: 'test-results/blog-publication-1440.png',
    fullPage: true,
  });
  await page.getByRole('switch', { name: 'おすすめ', exact: true }).uncheck();
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('保存済み');
  const published = await request.get(new URL('/blog/recommended/', url).href);
  expect(await published.text()).toContain(title);
  await publicPage.close();
});
