import { expect, test } from '@playwright/test';
import { emptyDraft } from '../src/features/events/draft';

test('keyword search, page reset and table-only horizontal scrolling', async ({ page, request }) => {
  const keyword = `一覧検証${Date.now()}`;
  const tags = await (await request.get('/api/tags')).json();
  for (let i = 0; i < 21; i++) {
    const response = await request.post('/api/contents', { headers: { Origin: 'http://127.0.0.1:5174' }, data: {
      type: 'event', operationId: crypto.randomUUID(), payload: { ...emptyDraft(), title: `${keyword} ${i} ${'長いタイトル'.repeat(15)}`, filmTagIds: [tags.filmTags[0].id] },
    } });
    expect(response.status()).toBe(201);
  }
  await page.goto('/cms/events');
  const search = page.getByLabel('キーワード検索');
  await search.fill(keyword); await search.press('Enter');
  await expect(page.getByText(/検索結果 21件/)).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount(20);
  await page.getByRole('button', { name: '2ページへ', exact: true }).click();
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await search.fill('見つからないキーワード'); await search.press('Enter');
  await expect(page.getByText(/検索結果 0件/)).toBeVisible();
  await search.fill(''); await search.press('Enter');
  await expect(page.getByRole('button', { name: '1ページ（現在のページ）', exact: true })).toBeVisible();
  await page.setViewportSize({ width: 1000, height: 900 });
  const tableRegion = page.getByRole('region', { name: 'イベント一覧' });
  expect(await tableRegion.evaluate((node) => node.scrollWidth > node.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.locator('tbody tr').first().locator('a')).toHaveCSS('text-overflow', 'ellipsis');
  await page.screenshot({ path: 'test-results/list-1000.png', fullPage: true });
});
