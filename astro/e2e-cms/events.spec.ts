import { expect, test } from '@playwright/test';
test('CMS detail uses the public layout, plain text and correct event metadata', async ({
  page,
}, testInfo) => {
  await page.goto('/events/cms-sample-screening/');
  await expect(
    page.getByRole('heading', { name: 'CMS検証用・会場とオンラインの上映会', exact: true }),
  ).toBeVisible();
  await expect(page.locator('main')).toContainText('2026/12/30 〜 2027/01/03');
  await expect(page.locator('main')).toContainText('各日 14:00 開場\n14:30 開演');
  await expect(page.locator('main')).toContainText('<script>alert(1)</script>');
  await expect(page.locator('main script:not([type="application/ld+json"])')).toHaveCount(0);
  const link = page.getByRole('link', { name: /^https:\/\/example.com\/contact/ });
  await expect(link).toHaveAttribute('href', 'https://example.com/contact');
  await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(page.getByRole('link', { name: /^MAP/ })).toHaveAttribute(
    'href',
    'https://example.com/map',
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://www.petiteadventurefilms.com/events/cms-sample-screening/',
  );
  const structured = (
    await page.locator('main script[type="application/ld+json"]').allTextContents()
  )
    .map((text) => JSON.parse(text) as Record<string, unknown>)
    .find((data) => data['@type'] === 'Event');
  expect(structured).toBeDefined();
  expect(structured?.eventAttendanceMode).toBe('https://schema.org/MixedEventAttendanceMode');
  expect(structured?.startDate).toBe('2026-12-30');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({
    path: `test-results-cms/cms-event-${testInfo.project.name}.png`,
    fullPage: true,
  });
});
test('online event omits physical venue and legacy page stays reachable', async ({ page }) => {
  await page.goto('/events/cms-sample-online/');
  await expect(page.locator('main')).toContainText('オンライン開催');
  await expect(page.locator('main')).toContainText('延期');
  await expect(page.getByRole('link', { name: /^MAP/ })).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText('まちの交流室');
  const structured = (
    await page.locator('main script[type="application/ld+json"]').allTextContents()
  )
    .map((text) => JSON.parse(text) as Record<string, unknown>)
    .find((data) => data['@type'] === 'Event');
  expect(structured).toBeDefined();
  expect(structured).not.toHaveProperty('location');
  expect(structured?.eventAttendanceMode).toBe('https://schema.org/OnlineEventAttendanceMode');
  const response = await page.goto('/events/18010/');
  expect(response?.status()).toBe(200);
  await expect(page.locator('main h2')).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'index, follow, max-image-preview:large',
  );
});
