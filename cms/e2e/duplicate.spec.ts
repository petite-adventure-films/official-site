import { expect, test } from '@playwright/test';

test('flushes current input, duplicates into a new draft and edits only the copy', async ({ page, request }) => {
  await page.goto('/cms/events/new');
  await page.getByLabel('タイトル', { exact: true }).fill('複製元');
  await expect(page.getByRole('status')).toHaveText('保存済み');
  const sourceId = page.url().split('/').at(-2)!;
  await page.getByLabel('開催日', { exact: true }).fill('2026/1');
  await page.getByLabel('会場名', { exact: true }).fill('保持する会場');
  await page.getByRole('button', { name: 'オフライン', exact: true }).click();
  await page.getByLabel('タイトル', { exact: true }).fill('未保存分も複製');
  await page.getByRole('button', { name: '複製', exact: true }).click();
  await expect(page).not.toHaveURL(new RegExp(sourceId));
  await expect(page.getByLabel('タイトル', { exact: true })).toHaveValue('未保存分も複製');
  await expect(page.getByRole('status')).toHaveText('保存済み');
  const copyId = page.url().split('/').at(-2)!;
  const original = await (await request.get(`/api/contents/${sourceId}`)).json();
  const copy = await (await request.get(`/api/contents/${copyId}`)).json();
  expect(copy.payload).toEqual(original.payload); expect(copy.version).toBe(1);
  await page.getByLabel('タイトル', { exact: true }).fill('複製した記事の変更');
  await expect(page.getByRole('status')).toHaveText('保存済み');
  expect(await (await request.get(`/api/contents/${sourceId}`)).json()).toEqual(original);
  await page.screenshot({ path: 'test-results/duplicate-1440.png', fullPage: true });
});

test('waits for an in-flight save and flushes edits made before duplication', async ({ page }) => {
  await page.goto('/cms/events/new');
  let release!: () => void; let received!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const started = new Promise<void>(resolve => { received = resolve; });
  await page.route('**/api/contents', async route => {
    if (route.request().method() !== 'POST') return route.continue();
    const response = await route.fetch(); received(); await gate; await route.fulfill({ response });
  });
  await page.getByLabel('タイトル', { exact: true }).fill('保存待ち');
  await started;
  await page.getByLabel('タイトル', { exact: true }).fill('追加入力');
  await page.getByRole('button', { name: '複製', exact: true }).click();
  await expect(page.getByText('複製中…', { exact: true })).toBeVisible();
  release();
  await expect(page.getByText('複製中…', { exact: true })).toHaveCount(0);
  await expect(page.getByLabel('タイトル', { exact: true })).toHaveValue('追加入力');
  await expect(page.getByRole('status')).toHaveText('保存済み');
});

test('failed save blocks duplication and retains input for retry', async ({ page }) => {
  await page.goto('/cms/events/new'); let copies = 0;
  page.on('request', req => { if (req.url().endsWith('/duplicate')) copies++; });
  await page.route('**/api/contents', route => route.request().method() === 'POST' ? route.abort() : route.continue());
  await page.getByLabel('タイトル', { exact: true }).fill('保存失敗中');
  await page.getByRole('button', { name: '複製', exact: true }).click();
  await expect(page.getByText('保存できなかったため、複製を中止しました。入力内容は残っています。')).toBeVisible();
  expect(copies).toBe(0);
  await expect(page.getByLabel('タイトル', { exact: true })).toHaveValue('保存失敗中');
  await page.unroute('**/api/contents');
  await page.getByRole('button', { name: '複製', exact: true }).click();
  await expect(page).toHaveURL(/\/cms\/events\/[0-9a-f-]+\/edit/);
  await expect(page.getByText('保存できなかったため、複製を中止しました。入力内容は残っています。')).toHaveCount(0);
});

test('lost duplicate response retries the same operation without creating another copy', async ({ page, request }) => {
  await page.goto('/cms/events/new');
  await page.getByLabel('タイトル', { exact: true }).fill('応答喪失');
  await expect(page.getByRole('status')).toHaveText('保存済み');
  const before = (await (await request.get('/api/contents?type=event')).json()).total;
  const bodies: string[] = [];
  await page.route('**/duplicate', async route => {
    bodies.push(route.request().postData()!);
    const response = await route.fetch();
    if (bodies.length === 1) await route.abort(); else await route.fulfill({ response });
  });
  await page.getByRole('button', { name: '複製', exact: true }).click();
  await expect(page.getByText('複製の結果を確認できませんでした。再試行では同じ複製を確認します。')).toBeVisible();
  await page.getByRole('button', { name: '複製を再試行', exact: true }).click();
  await expect(page.getByRole('button', { name: '複製', exact: true })).toBeVisible();
  expect(bodies).toHaveLength(2); expect(bodies[0]).toBe(bodies[1]);
  expect((await (await request.get('/api/contents?type=event')).json()).total).toBe(before + 1);
});
