import { expect, test } from '@playwright/test';
import { emptyDraft } from '../src/features/events/draft';

test('unknown attendance keeps venue details across editing, reload, publication check and duplicate', async ({ page, request }) => {
  const payload = { ...emptyDraft(), title: '旧イベントの不明な開催形式', formats: ['unknown'], startDate: '2026/11/25', venue: '原文の会場', address: '原文の住所', access: '原文の道順' };
  const response = await request.post('/api/contents', { headers: { Origin: 'http://127.0.0.1:5174' }, data: { type: 'event', operationId: crypto.randomUUID(), payload } });
  expect(response.status()).toBe(201);
  const saved = await response.json();
  await page.goto(`/cms/events/${saved.id}/edit`);
  await expect(page.getByRole('button', { name: '不明', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('textbox', { name: '会場名', exact: true })).toHaveValue('原文の会場');
  await page.getByRole('textbox', { name: '備考', exact: true }).fill('確認して追記');
  await expect(page.getByRole('status')).toHaveText('保存済み');
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'アクセス', exact: true })).toHaveValue('原文の道順');
  await expect(page.getByRole('textbox', { name: '備考', exact: true })).toHaveValue('確認して追記');
  const original = await (await request.get(`/api/contents/${saved.id}`)).json();
  expect(original.payload.formats).toEqual(['unknown']);
  const check = await request.post(`/api/contents/${saved.id}/check-publication`, { headers: { Origin: 'http://127.0.0.1:5174' }, data: { expectedVersion: original.version } });
  expect(check.status()).toBe(200);
  expect(await check.json()).toMatchObject({ ok: true });
  await page.getByRole('button', { name: '複製', exact: true }).click();
  await expect(page).not.toHaveURL(new RegExp(saved.id));
  await expect(page.getByRole('button', { name: '不明', exact: true })).toHaveAttribute('aria-pressed', 'true');
  const copyId = page.url().split('/').at(-2)!;
  expect((await (await request.get(`/api/contents/${copyId}`)).json()).payload).toEqual(original.payload);
  await page.getByRole('button', { name: 'オンライン', exact: true }).click();
  await expect(page.getByRole('button', { name: '不明', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: '不明', exact: true }).click();
  await expect(page.getByRole('textbox', { name: '会場名', exact: true })).toHaveValue('原文の会場');
  await page.screenshot({ path: 'test-results/legacy-event-unknown.png', fullPage: true });
});

test('imported organizer links survive editing, reload and duplication', async ({ page, request }) => {
  test.setTimeout(180_000);
  const organizer = { schemaVersion: 2, doc: { type: 'doc', content: [{ type: 'paragraph', content: [
    { type: 'text', text: '問い合わせ：' },
    { type: 'text', text: '主催者の窓口', marks: [{ type: 'link', attrs: { href: 'https://example.com/contact?a=1&b=2', target: '_blank', title: 'お問い合わせ' } }] },
  ] }] } };
  const payload = { ...emptyDraft(), title: '旧イベントのリンク', formats: ['unknown'], startDate: '2026/11/25', organizer };
  const response = await request.post('/api/contents', { headers: { Origin: 'http://127.0.0.1:5174' }, data: { type: 'event', operationId: crypto.randomUUID(), payload } });
  expect(response.status()).toBe(201);
  const saved = await response.json();
  await page.goto(`/cms/events/${saved.id}/edit`);
  const body = page.getByRole('textbox', { name: '主催者・問い合わせ', exact: true });
  await expect(body.locator('a')).toHaveAttribute('href', 'https://example.com/contact?a=1&b=2');
  await body.click(); await page.keyboard.press('ControlOrMeta+End'); await page.keyboard.press('Enter'); await page.keyboard.insertText('追記した案内');
  await expect(page.getByRole('status')).toHaveText('保存済み');
  await page.reload();
  await expect(body).toContainText('追記した案内');
  await expect(body.locator('a')).toHaveAttribute('target', '_blank');
  await expect(body.locator('a')).toHaveAttribute('title', 'お問い合わせ');
  const original = await (await request.get(`/api/contents/${saved.id}`)).json();
  const check = await request.post(`/api/contents/${saved.id}/check-publication`, { headers: { Origin: 'http://127.0.0.1:5174' }, data: { expectedVersion: original.version } });
  expect(await check.json()).toMatchObject({ ok: true });
  await page.getByRole('button', { name: '公開', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: '公開する', exact: true }).click();
  const publicLink = page.getByRole('link', { name: '公開ページを見る', exact: true });
  await expect(publicLink).toBeVisible({ timeout: 90_000 });
  const publicPage = await page.context().newPage();
  await publicPage.goto((await publicLink.getAttribute('href'))!);
  const organizerLink = publicPage.getByRole('link', { name: /^主催者の窓口/ });
  await expect(organizerLink).toHaveAttribute('href', 'https://example.com/contact?a=1&b=2');
  await expect(organizerLink).toHaveAttribute('target', '_blank');
  await expect(publicPage.locator('main')).toContainText('追記した案内');
  const structured = await publicPage.locator('script[type="application/ld+json"]').allTextContents();
  expect(structured.join('')).not.toContain('EventAttendanceMode');
  await publicPage.screenshot({ path: 'test-results/legacy-event-public.png', fullPage: true });
  await publicPage.close();
  await page.getByRole('button', { name: '複製', exact: true }).click();
  await expect(page).not.toHaveURL(new RegExp(saved.id));
  await expect(body).toContainText('追記した案内');
  const copyId = page.url().split('/').at(-2)!;
  expect((await (await request.get(`/api/contents/${copyId}`)).json()).payload.organizer).toEqual(original.payload.organizer);
  await page.screenshot({ path: 'test-results/legacy-event-rich-text.png', fullPage: true });
});
