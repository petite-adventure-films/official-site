import { expect, test } from '@playwright/test';
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j8WQAAAAASUVORK5CYII=', 'base64');
const pdf = Buffer.from('%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\n%%EOF\n');
test('uploads image and PDF, edits alt text, saves, reopens and duplicates asset references', async ({ page, request }) => {
  await page.goto('/cms/blog/new');
  await page.getByRole('textbox', { name: 'タイトル', exact: true }).fill('添付の確認');
  const body = page.getByRole('textbox', { name: '本文', exact: true });await body.fill('本文の添付');await body.press('End');await body.press('Enter');
  await page.getByRole('button', { name: '画像', exact: true }).click();
  await page.getByLabel('登録するファイル').setInputFiles({ name: 'test-image.png', mimeType: 'image/png', buffer: png });
  await page.getByRole('button', { name: '登録', exact: true }).click();
  await page.getByRole('textbox', { name: '代替テキスト', exact: true }).fill('画像の説明');
  await page.screenshot({ path: 'test-results/media-picker.png', fullPage: true });
  await page.getByRole('button', { name: '挿入', exact: true }).click();
  await expect(body.locator('img')).toHaveAttribute('alt', '画像の説明');
  await body.locator('img').click();await page.getByRole('button', { name: '画像', exact: true }).click();
  await page.getByRole('textbox', { name: '代替テキスト', exact: true }).fill('更新した説明');await page.getByRole('button', { name: '適用' }).click();
  await expect(body.locator('img')).toHaveAttribute('alt', '更新した説明');
  await body.locator('p').last().click();
  await page.getByRole('button', { name: 'PDF', exact: true }).click();
  await page.getByLabel('登録するファイル').setInputFiles({ name: 'guide.pdf', mimeType: 'application/pdf', buffer: pdf });
  await page.getByRole('button', { name: '登録', exact: true }).click();
  await page.getByRole('textbox', { name: 'リンク文字列', exact: true }).fill('案内をダウンロード');
  await page.getByRole('button', { name: '挿入', exact: true }).click();
  await expect(body.getByRole('link', { name: '案内をダウンロード' })).toHaveAttribute('href', /\/api\/media\/asset_.*\/file/);
  await expect(page.getByRole('status')).toHaveText('保存済み');
  const id = page.url().split('/').at(-2)!;const original = await (await request.get('/api/contents/' + id)).json();
  await page.reload();await expect(body.locator('img')).toHaveAttribute('alt', '更新した説明');await expect(body.getByRole('link')).toHaveText('案内をダウンロード');
  expect(await body.locator('img').evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth === 1)).toBe(true);
  await page.getByRole('button', { name: '複製', exact: true }).click();
  await expect(page).not.toHaveURL(new RegExp(id));await expect(body.locator('img')).toHaveAttribute('alt', '更新した説明');
  const copied = await (await request.get('/api/contents/' + page.url().split('/').at(-2)!)).json();expect(copied.payload.body).toEqual(original.payload.body);
  await page.screenshot({ path: 'test-results/media-editor.png', fullPage: true });
  // Registered PDF can be selected without another upload.
  await body.locator('p').last().click();await page.getByRole('button', { name: 'PDF', exact: true }).click();await page.getByLabel('ファイル名で検索').fill('guide');
  await page.getByRole('button', { name: 'guide.pdf', exact: true }).click();await page.getByRole('button', { name: 'キャンセル' }).click();
  expect((await (await request.get('/api/contents/' + copied.id)).json()).payload.body).toEqual(copied.payload.body);
});
test('failed upload leaves text intact and lost completion response retries one asset', async ({ page, request }) => {
  await page.goto('/cms/blog/new');const body = page.getByRole('textbox', { name: '本文', exact: true });await body.fill('失ってはいけない本文');
  await page.getByRole('button', { name: '画像', exact: true }).click();
  await page.getByLabel('登録するファイル').setInputFiles({ name: 'retry.png', mimeType: 'image/png', buffer: png });
  await page.route('**/api/local/media/*', route => route.abort(), { times: 1 });
  await page.getByRole('button', { name: '登録', exact: true }).click();await expect(page.getByRole('alert')).toContainText('登録できません');await expect(page.locator('.cms-body-editor')).toHaveText('失ってはいけない本文');
  let assetId = '';
  await page.route('**/api/media/*/complete', async route => { assetId = route.request().url().split('/').at(-2)!;await route.fetch();await route.abort(); }, { times: 1 });
  await page.getByRole('button', { name: '登録', exact: true }).click();await expect(page.getByRole('alert')).toContainText('登録できません');
  await page.getByRole('button', { name: '登録', exact: true }).click();await expect(page.getByRole('textbox', { name: '代替テキスト', exact: true })).toBeVisible();
  const assets = await (await request.get('/api/media?kind=image&q=retry.png')).json();expect(assets.count).toBe(1);expect(assets.items[0].id).toBe(assetId);
  await page.getByRole('button', { name: 'キャンセル' }).click();await expect(page.locator('.cms-body-editor')).toHaveText('失ってはいけない本文');
});
test('all supported image formats decode after upload, insertion and reload', async ({ page, request }) => {
  await page.goto('/cms/blog/new');const body = page.getByRole('textbox', { name: '本文', exact: true });await body.fill('画像形式の確認');
  for (const extension of ['png', 'jpg', 'gif', 'webp']) {
    await body.locator('p').last().click();await page.getByRole('button', { name: '画像', exact: true }).click();
    await page.getByLabel('登録するファイル').setInputFiles(`e2e/fixtures/media/sample.${extension}`);
    await page.getByRole('button', { name: '登録', exact: true }).click();await page.getByRole('textbox', { name: '代替テキスト', exact: true }).fill(extension + 'の画像');
    await page.getByRole('button', { name: '挿入', exact: true }).click();
  }
  await expect(page.getByRole('status')).toHaveText('保存済み');await page.reload();await expect(body.locator('img')).toHaveCount(4);
  await expect.poll(() => body.locator('img').evaluateAll(images => images.every(image => (image as HTMLImageElement).naturalWidth === 32 && (image as HTMLImageElement).naturalHeight === 24))).toBe(true);
  const payload = (await (await request.get('/api/contents/' + page.url().split('/').at(-2)!)).json()).payload;
  expect(JSON.stringify(payload)).not.toContain('storageKey');expect(JSON.stringify(payload)).not.toContain('uploadUrl');
});
