import { expect, test } from '@playwright/test';
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
test('flushes edits, selects history, restores and swaps protected draft without publishing', async ({ page, request }) => {
  const contentId = id(1);
  await page.goto(`/cms/events/${contentId}/edit`);
  await page.getByRole('textbox', { name: 'タイトル', exact: true }).fill('直前の入力を保護');
  await page.getByRole('button', { name: '公開履歴', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${contentId}/history$`));
  expect((await (await request.get(`/api/contents/${contentId}`)).json()).payload.title).toBe('直前の入力を保護');
  const rows = page.getByRole('button', { name: /公開済/ });
  await expect(rows).toHaveCount(3);
  await rows.nth(1).focus(); await page.keyboard.press('Enter');
  await expect(rows.nth(1)).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: '上映会のお知らせ 2' })).toBeVisible();
  await page.getByRole('button', { name: 'この内容を下書きに戻す' }).click();
  await expect(page).toHaveURL(new RegExp(`${contentId}/edit$`));
  await expect(page.getByText('選んだ内容を下書きに戻しました。')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'タイトル', exact: true })).toHaveValue('上映会のお知らせ 2');
  await page.getByRole('button', { name: '公開履歴', exact: true }).click();
  await expect(page.getByRole('button', { name: /編集中/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: '直前の入力を保護' })).toBeVisible();
  await page.screenshot({ path: 'test-results/history-1440.png', fullPage: true });
  await page.getByRole('button', { name: 'この内容を下書きに戻す' }).click();
  await expect(page.getByRole('textbox', { name: 'タイトル', exact: true })).toHaveValue('直前の入力を保護');
  const history = await (await request.get(`/api/contents/${contentId}/history`)).json();
  expect(history.items.filter((item: any) => item.kind === 'publication')).toHaveLength(3);
});
test('history read failure stays on route; lost restore response retries the same operation', async ({ page }) => {
  const contentId = id(2);
  await page.route('**/history', route => route.request().resourceType() === 'fetch' ? route.abort() : route.continue());
  await page.goto(`/cms/events/${contentId}/history`);
  await expect(page.getByRole('alert')).toContainText('公開履歴を取得できませんでした');
  await expect(page).toHaveURL(/\/history$/);
  await page.unroute('**/history'); await page.getByRole('button', { name: '再試行', exact: true }).click();
  const bodies: string[] = [];
  await page.route('**/restore', async route => {
    bodies.push(route.request().postData()!);
    const response = await route.fetch();
    if (bodies.length === 1) await route.abort(); else await route.fulfill({ response });
  });
  await page.getByRole('button', { name: 'この内容を下書きに戻す' }).click();
  await expect(page.getByRole('alert')).toContainText('復元の結果を確認できませんでした');
  await page.getByRole('button', { name: '復元を再試行' }).click();
  await expect(page).toHaveURL(/\/edit$/);
  expect(bodies).toHaveLength(2); expect(bodies[0]).toBe(bodies[1]);
});
test('save failure blocks history navigation and concurrent edits block restoration', async ({ page, request }) => {
  const contentId = id(3);
  await page.goto(`/cms/events/${contentId}/edit`);
  await page.route(`**/api/contents/${contentId}`, route => route.request().method() === 'PUT' ? route.abort() : route.continue());
  await page.getByRole('textbox', { name: 'タイトル', exact: true }).fill('保存に失敗しても保持');
  await page.getByRole('button', { name: '公開履歴', exact: true }).click();
  await expect(page.getByText('保存できなかったため、公開履歴を開けませんでした。入力内容は残っています。')).toBeVisible();
  await expect(page).toHaveURL(/\/edit$/);
  await page.unroute(`**/api/contents/${contentId}`);
  await page.getByRole('button', { name: '公開履歴', exact: true }).click();
  await expect(page).toHaveURL(/\/history$/);
  await expect(page.getByRole('heading', { name: '上映会のお知らせ 3' })).toBeVisible();
  const current = await (await request.get(`/api/contents/${contentId}`)).json();
  const updated = await request.put(`/api/contents/${contentId}`, { headers: { Origin: 'http://127.0.0.1:5174' }, data: {
    operationId: crypto.randomUUID(), expectedVersion: current.version, payload: { ...current.payload, title: '別画面の編集' },
  } });
  expect(updated.status()).toBe(200);
  await page.getByRole('button', { name: 'この内容を下書きに戻す' }).click();
  await expect(page.getByRole('alert')).toContainText('別の画面で更新されています');
  expect((await (await request.get(`/api/contents/${contentId}`)).json()).payload.title).toBe('別画面の編集');
});
test('empty history redirects to editor and disables the entry', async ({ page, request }) => {
  const existing = await (await request.get(`/api/contents/${id(1)}`)).json();
  const created = await (await request.post('/api/contents', { headers: { Origin: 'http://127.0.0.1:5174' }, data: {
    operationId: crypto.randomUUID(), type: 'event', payload: existing.payload,
  } })).json();
  await page.goto(`/cms/events/${created.id}/history`);
  await expect(page).toHaveURL(new RegExp(`${created.id}/edit$`));
  await expect(page.getByRole('button', { name: '公開履歴', exact: true })).toBeDisabled();
});
test('long names and text wrap without overflow and input HTML remains plain text', async ({ page }) => {
  await page.route('**/api/contents/*/history', async route => {
    const response = await route.fetch(); const data = await response.json();
    for (const item of data.items) {
      item.actorName = 'とても長いユーザー名'.repeat(6);
      item.payload.notes = '<img src=x onerror=alert(1)>\n' + '長文'.repeat(300);
    }
    await route.fulfill({ response, json: data });
  });
  await page.setViewportSize({ width: 1000, height: 900 });
  await page.goto(`/cms/events/${id(1)}/history`);
  await expect(page.getByText(/<img src=x onerror=alert/)).toBeVisible();
  await expect(page.locator('main img')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: /公開済/ }).first().focus();
  await expect(page.getByRole('button', { name: /公開済/ }).first()).toBeFocused();
  await page.screenshot({ path: 'test-results/history-long-1000.png', fullPage: true });
});
