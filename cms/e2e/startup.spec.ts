import { expect, test } from '@playwright/test';

test('local UI starts with the isolated development session', async ({ page, request }) => {
  await page.goto('/cms/events');
  await expect(page).toHaveTitle('PAF CMS');
  const response = await request.get('/api/session');
  expect(response.status()).toBe(200);
  expect((await response.json()).user.id).toBe('local-editor');
  expect(response.headers()['cache-control']).toBe('no-store');
});
