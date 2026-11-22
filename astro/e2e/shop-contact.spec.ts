import { expect, test } from '@playwright/test';

// API呼び出しを禁止し、決済・実送信を伴わない画面操作だけを検証する。
test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', (route) => route.abort());
});

test('product tabs expose their panels and support keyboard navigation', async ({ page }) => {
  await page.goto('/pafshop/goodbye_ur/');
  const tabs = page.getByRole('tablist', { name: '商品情報' }).getByRole('tab');
  for (let index = 0; index < 3; index++) {
    const id = await tabs.nth(index).getAttribute('aria-controls');
    const tabId = await tabs.nth(index).getAttribute('id');
    if (!id || !tabId) throw new Error('Tab/panel IDs are required');
    await expect(page.locator(`#${id}`)).toHaveAttribute('role', 'tabpanel');
    await expect(page.locator(`#${id}`)).toHaveAttribute('aria-labelledby', tabId);
  }
  await tabs.first().focus();
  await page.keyboard.press('ArrowLeft');
  await expect(tabs.last()).toBeFocused();
  await expect(page.getByRole('tabpanel', { name: '制作クレジット' })).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.first()).toBeFocused();
  await page.keyboard.press('End');
  await expect(tabs.last()).toBeFocused();
  await page.keyboard.press('Home');
  await expect(tabs.first()).toBeFocused();
  await tabs.nth(1).click();
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(tabs.first()).toHaveAttribute('tabindex', '-1');
  await expect(page.getByRole('tabpanel')).toHaveCount(1);
});

test('cart updates quantities, shipping and removal without checkout', async ({ page }) => {
  await page.goto('/pafshop/otome_house/');
  await page.getByRole('combobox', { name: '一般 DVDの数量', exact: true }).selectOption('1');
  await page.getByRole('button', { name: 'カートに入れる' }).click();
  await page.getByRole('dialog').getByRole('link', { name: 'カートを見る' }).click();
  const quantity = page.getByRole('combobox', { name: '乙女ハウス 一般 DVDの数量' });
  await expect(quantity).toHaveValue('1');
  await expect(page.locator('dl')).toContainText('￥1,300');
  await quantity.selectOption('3');
  await expect(page.locator('dl')).toContainText('送料￥0');
  await page.reload();
  await expect(quantity).toHaveValue('3');
  await quantity.selectOption('0');
  await expect(page.getByText('カートに商品がありません')).toBeVisible();
});

test('contact errors are associated with fields and confirmation remains editable', async ({
  page,
}) => {
  await page.goto('/contact/');
  const email = page.getByLabel('メールアドレス', { exact: true });
  await email.fill('invalid');
  await email.blur();
  await expect(email).toHaveAttribute('aria-invalid', 'true');
  await expect(email).toHaveAccessibleDescription('メールアドレスの形式が正しくありません');
  await page.getByLabel('名前', { exact: true }).fill('画面確認');
  await email.fill('review@example.com');
  await page.getByLabel('メールアドレス確認').fill('review@example.com');
  await page.getByLabel('お問い合わせ内容').fill('ローカル画面確認。送信しません。');
  await expect(email).toHaveAttribute('aria-invalid', 'false');
  await expect(email).not.toHaveAttribute('aria-describedby');
  await page.getByRole('button', { name: '内容を確認する' }).click();
  await expect(page.getByRole('button', { name: '送信する' })).toBeVisible();
  await page.getByRole('button', { name: '内容を編集する' }).click();
  await expect(email).toBeEnabled();
  await expect(email).toHaveValue('review@example.com');
});
