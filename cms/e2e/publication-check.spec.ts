import { expect, test } from '@playwright/test';

test('editing saves drafts without exposing an interim publication workflow', async ({ page, request }) => {
  const checks: string[] = [];
  page.on('request', req => { if (req.url().includes('/check-publication')) checks.push(req.url()); });
  await page.goto('/cms/events/new');
  await expect(page.getByRole('button', { name: '公開', exact: true })).toBeDisabled();
  await page.getByRole('textbox', { name: 'タイトル', exact: true }).fill('下書きとして保存');
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page).toHaveURL(/\/cms\/events\/[0-9a-f-]+\/edit$/);
  const id = page.url().split('/').at(-2)!;
  expect((await (await request.get(`/api/contents/${id}`)).json()).payload.title).toBe('下書きとして保存');
  await expect(page.getByText(/公開処理は準備中|まだ公開されていません|入力内容に問題は見つかりません/)).toHaveCount(0);
  expect(checks).toEqual([]);
  await page.screenshot({ path: 'test-results/draft-editor-1440.png', fullPage: true });
});
