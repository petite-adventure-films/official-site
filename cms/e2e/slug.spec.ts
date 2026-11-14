import { expect, test } from '@playwright/test';

test('initial ID slug, custom slug, incomplete input and copy URLs survive persistence', async ({ page, request }) => {
  await page.goto('/cms/events/new');
  await expect(page.getByLabel('slug', { exact: true })).toHaveValue('');
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('保存済み');
  const id = page.url().split('/').at(-2)!;
  await expect(page.getByLabel('slug', { exact: true })).toHaveValue(id);
  await expect(page.getByText(`公開時のURL：/events/${id}/`, { exact: true })).toBeVisible();
  await page.getByLabel('slug', { exact: true }).fill('paris-screening');
  await page.getByRole('textbox', { name: 'タイトル', exact: true }).fill('タイトル変更');
  await expect(page.getByRole('status')).toHaveText('保存済み');
  await page.reload();
  await expect(page.getByLabel('slug', { exact: true })).toHaveValue('paris-screening');
  await page.getByLabel('slug', { exact: true }).fill('途中 / 入力');
  await expect(page.getByRole('status')).toHaveText('保存済み');
  await page.reload();
  await expect(page.getByLabel('slug', { exact: true })).toHaveValue('途中 / 入力');
  await expect(page.getByText('空白・スラッシュ・URLの区切り記号は使えません。 入力途中でも下書き保存できます。')).toBeVisible();
  await page.getByLabel('slug', { exact: true }).fill('paris-screening');
  await page.getByRole('button', { name: '複製', exact: true }).click();
  await expect(page).not.toHaveURL(new RegExp(id));
  const copyId = page.url().split('/').at(-2)!;
  await expect(page.getByLabel('slug', { exact: true })).toHaveValue(copyId);
  expect((await (await request.get(`/api/contents/${id}`)).json()).payload.slug).toBe('paris-screening');
  await page.screenshot({ path: 'test-results/slug-required-1440.png', fullPage: true });
});

test('publication requirements are announced while blank drafts remain saveable', async ({ page }) => {
  await page.goto('/cms/events/new');
  for (const label of ['タイトル', '開催日', '会場名']) {
    await expect(page.getByRole('textbox', { name: label, exact: true })).toHaveAttribute('aria-required', 'true');
    await expect(page.getByRole('textbox', { name: label, exact: true })).not.toHaveAttribute('required');
  }
  await expect(page.getByLabel('住所', { exact: true })).not.toHaveAttribute('aria-required');
  for (const marker of await page.locator('.MuiFormLabel-asterisk').all()) {
    await expect(marker).toHaveCSS('color', 'rgb(211, 47, 47)');
  }
  await expect(page.getByRole('group', { name: '開催形式 *', exact: true }).locator('legend span')).toHaveCSS('color', 'rgb(211, 47, 47)');
  await page.getByLabel('複数日にわたる').check();
  await expect(page.getByRole('textbox', { name: '終了日', exact: true })).toHaveAttribute('aria-required', 'true');
  await page.getByLabel('複数日にわたる').uncheck();
  await expect(page.getByRole('textbox', { name: '終了日', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'オフライン', exact: true }).click();
  await expect(page.getByRole('textbox', { name: '会場名', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('保存済み');
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'タイトル', exact: true })).toHaveValue('');
});
