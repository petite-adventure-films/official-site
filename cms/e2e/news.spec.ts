import { expect, test } from '@playwright/test';

test('news keeps its own form, publishes an anchored list item, and restores only the draft', async ({
  page,
  request,
}) => {
  test.setTimeout(180_000);
  const title = `お知らせ受け入れ ${Date.now()}`;
  await page.goto('/cms/news/new');
  const titleField = page.getByRole('textbox', {
    name: 'タイトル',
    exact: true,
  });
  const body = page.getByRole('textbox', { name: '本文', exact: true });
  await expect(
    page.getByRole('textbox', { name: 'slug', exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole('switch', { name: 'おすすめ' })).toHaveCount(0);
  await titleField.fill(title);
  await body.fill('旧記事から引き継ぐ本文の確認');
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('保存済み');
  const id = page.url().split('/').at(-2)!;
  await page.reload();
  await expect(body).toHaveText('旧記事から引き継ぐ本文の確認');
  await expect(page.getByText(/作成日時/)).toBeVisible();
  await expect(page.getByText(/最終編集日時/)).toBeVisible();
  await page.screenshot({
    path: 'test-results/news-editor-1440.png',
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
  const url = (await link.getAttribute('href'))!;
  expect(new URL(url).pathname).toBe('/news/');
  expect(new URL(url).hash).toBe(`#cms-${id}`);
  const publicPage = await page.context().newPage();
  await publicPage.goto(url);
  await expect(publicPage.locator(`#cms-${id}`)).toContainText(title);
  await expect(publicPage.locator(`#cms-${id}`)).toContainText(
    '旧記事から引き継ぐ本文の確認',
  );
  await publicPage.close();
  await titleField.fill('公開しない編集中のタイトル');
  await page.getByRole('button', { name: '公開履歴', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${id}/history$`));
  await page.getByRole('button', { name: /公開済/ }).click();
  await expect(
    page.getByRole('heading', { name: title, exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'この内容を下書きに戻す' }).click();
  await expect(titleField).toHaveValue(title);
  await titleField.fill('復元後に再編集したお知らせ');
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('保存済み');
  await page.reload();
  await expect(titleField).toHaveValue('復元後に再編集したお知らせ');
  const published = await request.get(url);
  expect(await published.text()).toContain(title);
  expect(await published.text()).not.toContain('復元後に再編集したお知らせ');
  const history = await (
    await request.get(`/api/contents/${id}/history`)
  ).json();
  expect(
    history.items.filter(
      (item: { kind: string }) => item.kind === 'publication',
    ),
  ).toHaveLength(1);
  expect(
    history.items.find(
      (item: { kind: string }) => item.kind === 'protectedDraft',
    ).payload.title,
  ).toBe('公開しない編集中のタイトル');
});
