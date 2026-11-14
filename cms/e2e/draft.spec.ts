import { expect, test } from '@playwright/test';

test('empty view creates nothing; incomplete dates and hidden values survive reopening', async ({ page, request }) => {
  const before = (await (await request.get('/api/contents?type=event')).json()).total;
  await page.goto('/cms/events/new');
  await expect(page.getByLabel('タイトル', { exact: true })).toBeVisible();
  await expect(page.locator('.MuiOutlinedInput-notchedOutline').first()).toHaveCSS('border-top-style', 'solid');
  await page.waitForTimeout(1200);
  expect((await (await request.get('/api/contents?type=event')).json()).total).toBe(before);
  const title = `保存の確認 ${Date.now()}`;
  await page.getByLabel('タイトル', { exact: true }).fill(title);
  await page.getByLabel('開催日', { exact: true }).fill('2026/1');
  await page.getByLabel('複数日にわたる').check();
  await page.getByLabel('終了日', { exact: true }).fill('2020/99');
  await page.getByLabel('会場名', { exact: true }).fill('保持する会場');
  await page.getByLabel('複数日にわたる').uncheck();
  await page.getByRole('button', { name: 'オフライン', exact: true }).click();
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('保存済み');
  await expect(page).toHaveURL(/\/cms\/events\/[0-9a-f-]+\/edit$/);
  await page.reload();
  await expect(page.getByLabel('開催日', { exact: true })).toHaveValue('2026/1');
  await expect(page.getByLabel('終了日', { exact: true })).toHaveCount(0);
  await page.getByLabel('複数日にわたる').check();
  await expect(page.getByLabel('終了日', { exact: true })).toHaveValue('2020/99');
  await page.getByRole('button', { name: 'オフライン', exact: true }).click();
  await expect(page.getByLabel('会場名', { exact: true })).toHaveValue('保持する会場');
  await expect(page.getByRole('status')).toHaveText('保存済み');
  await page.getByRole('link', { name: 'イベント一覧' }).click();
  await page.getByLabel('キーワード検索').fill(title);
  await page.getByLabel('キーワード検索').press('Enter');
  await page.getByRole('link', { name: title, exact: true }).click();
  await expect(page.getByLabel('タイトル', { exact: true })).toHaveValue(title);
  await page.screenshot({ path: 'test-results/editor-1440.png', fullPage: true });
});

test('edits made while a response is delayed are saved in the next request', async ({ page }) => {
  await page.goto('/cms/events/new');
  let release: (() => void) | undefined;
  let received: (() => void) | undefined;
  const started = new Promise<void>((resolve) => { received = resolve; });
  const gate = new Promise<void>((resolve) => { release = resolve; });
  await page.route('**/api/contents', async (route) => {
    if (route.request().method() !== 'POST') return route.continue();
    const response = await route.fetch();
    received!(); await gate;
    await route.fulfill({ response });
  });
  await page.getByLabel('タイトル', { exact: true }).fill('最初の入力');
  await started;
  await page.getByLabel('タイトル', { exact: true }).fill('応答待ち中の追加入力');
  await page.waitForTimeout(1200);
  release!();
  await expect(page.getByRole('status')).toHaveText('保存済み');
  await page.reload();
  await expect(page.getByLabel('タイトル', { exact: true })).toHaveValue('応答待ち中の追加入力');
});

test('another editor causes a conflict without replacing current input', async ({ page, request }) => {
  await page.goto('/cms/events/new');
  await page.getByLabel('タイトル', { exact: true }).fill('競合前');
  await expect(page.getByRole('status')).toHaveText('保存済み');
  const id = page.url().split('/').at(-2)!;
  const saved = await (await request.get(`/api/contents/${id}`)).json();
  const response = await request.put(`/api/contents/${id}`, { headers: { Origin: 'http://127.0.0.1:5174' },
    data: { operationId: crypto.randomUUID(), expectedVersion: saved.version, payload: { ...saved.payload, title: '別の編集者の内容' } } });
  expect(response.status()).toBe(200);
  await page.getByLabel('タイトル', { exact: true }).fill('この画面の入力');
  await expect(page.getByRole('alert')).toContainText('別の画面で更新されています');
  await expect(page.getByLabel('タイトル', { exact: true })).toHaveValue('この画面の入力');
  await expect(page.getByRole('button', { name: '保存', exact: true })).toBeDisabled();
  expect((await (await request.get(`/api/contents/${id}`)).json()).payload.title).toBe('別の編集者の内容');
});

test('failed save keeps input and retry saves it', async ({ page }) => {
  await page.goto('/cms/events/new');
  await page.route('**/api/contents', (route) => route.request().method() === 'POST' ? route.abort() : route.continue());
  await page.getByLabel('タイトル', { exact: true }).fill('通信失敗しても保持');
  await expect(page.getByRole('alert')).toContainText('保存できませんでした');
  await expect(page.getByLabel('タイトル', { exact: true })).toHaveValue('通信失敗しても保持');
  await page.unroute('**/api/contents');
  await page.getByRole('button', { name: '再試行' }).click();
  await expect(page.getByRole('status')).toHaveText('保存済み');
  await page.reload();
  await expect(page.getByLabel('タイトル', { exact: true })).toHaveValue('通信失敗しても保持');
});
