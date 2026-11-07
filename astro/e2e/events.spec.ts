import { expect, test } from '@playwright/test';

test('基準文字サイズを拡大するとカードの文字と行高も拡大する', async ({ page }) => {
  await page.goto('/events/archive/2025/');
  const card = page.getByRole('link', { name: /さようならUR.*#226/ });
  const title = card.locator('p');
  const tag = card.getByText('上映会', { exact: true });
  const info = card.getByText(/^#高島平地域センター/);

  // ブラウザー設定画面の自動操作ではなく、remの基準となるルート文字サイズを変えて検証する。
  await page.addStyleTag({ content: 'html { font-size: 16px !important; }' });
  await expect(title).toHaveCSS('font-size', '14px');
  await expect(title).toHaveCSS('line-height', '22.75px');
  for (const label of [tag, info]) {
    await expect(label).toHaveCSS('font-size', '12px');
    await expect(label).toHaveCSS('line-height', '16px');
  }

  await page.addStyleTag({ content: 'html { font-size: 32px !important; }' });
  await expect(title).toHaveCSS('font-size', '28px');
  await expect(title).toHaveCSS('line-height', '45.5px');
  for (const label of [tag, info]) {
    await expect(label).toHaveCSS('font-size', '24px');
    await expect(label).toHaveCSS('line-height', '32px');
  }
  expect(await card.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  await card.click();
  await expect(page).toHaveURL('/events/17820/');
});

test('月別タブの選択に応じて一覧が切り替わる', async ({ page }) => {
  await page.goto('/events/');
  const latest = page.getByRole('tab', { name: '最新', exact: true });
  const april = page.getByRole('tab', { name: '4', exact: true });
  await expect(latest).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toHaveCount(1);
  await april.click();
  await expect(april).toHaveAttribute('aria-selected', 'true');
  await expect(latest).toHaveAttribute('aria-selected', 'false');
  await expect(page.getByRole('tabpanel')).toHaveCount(1);
  await expect(
    page.getByRole('tabpanel', { name: '4', exact: true }).getByRole('link').first(),
  ).toBeVisible();
  await latest.click();
  await expect(
    page
      .getByRole('tabpanel', { name: '最新' })
      .getByRole('link', { name: /映像ワークショップ開講/ }),
  ).toBeVisible();
});

test('矢印・Home・Endでタブを操作できる', async ({ page }) => {
  await page.goto('/events/');
  const tabs = page.getByRole('tab');
  const latest = tabs.first();
  await latest.focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
  await expect(latest).toHaveAttribute('tabindex', '-1');
  await page.keyboard.press('End');
  await expect(tabs.last()).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(latest).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(tabs.last()).toBeFocused();
  await page.keyboard.press('Home');
  await expect(latest).toBeFocused();
  await expect(latest).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toHaveCount(1);
});

test('Tabでカードに移動し、フォーカスを表示してEnterで詳細へ進む', async ({ page }) => {
  await page.goto('/events/');
  await page.getByRole('tab', { name: '最新', exact: true }).focus();
  await page.keyboard.press('Tab');
  const card = page
    .getByRole('tabpanel', { name: '最新' })
    .getByRole('link', { name: /映像ワークショップ開講/ });
  await expect(card).toBeFocused();
  await expect(card).toHaveCSS('outline-style', 'solid');
  await expect(card).toHaveCSS('outline-width', '2px');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/events/18058/');
  await expect(page.getByRole('heading', { name: /映像ワークショップ開講/ })).toBeVisible();
  await expect(page.getByText('開催期間', { exact: true })).toBeVisible();
});

test('年別一覧の長文・複数タグが画面内に収まり詳細へ進める', async ({ page }) => {
  await page.goto('/events/archive/2025/');
  await expect(page.getByRole('heading', { name: '2025年のイベント・上映会' })).toBeVisible();
  const card = page.getByRole('link', { name: /さようならUR.*#226/ });
  await expect(card).toContainText('上映会');
  await expect(card).toContainText('高島平地域センター');
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  const cards = page.locator('main a[href^="/events/"]').filter({ has: page.locator('p') });
  expect(await cards.count()).toBeGreaterThan(0);
  for (const item of await cards.all()) {
    const bounds = await item.boundingBox();
    if (!bounds) throw new Error('Card is not visible');
    const viewport = page.viewportSize();
    if (!viewport) throw new Error('Viewport is not configured');
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width);
    expect(await item.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  }
  await card.click();
  await expect(page).toHaveURL('/events/17820/');
  await expect(page.getByRole('heading', { name: /さようならUR.*上映/ })).toBeVisible();
});
