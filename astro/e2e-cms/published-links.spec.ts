import { test, expect } from '@playwright/test';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readCmsRelease } from '../src/lib/released-cms-blogs';

test('released links preserve same-tab/new-tab behavior, titles and destination', async ({
  page,
  context,
}) => {
  const directory = await mkdtemp(join(tmpdir(), 'paf-link-render-'));
  const previous = process.env.CMS_BLOG_RELEASE_SNAPSHOT;
  let html: string;
  try {
    const file = join(directory, 'release.json');
    await writeFile(file, JSON.stringify({ blogs: [], assets: [] }));
    process.env.CMS_BLOG_RELEASE_SNAPSHOT = file;
    const { render } = await readCmsRelease();
    html = render({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: '別タブ',
              marks: [
                {
                  type: 'link',
                  attrs: {
                    href: 'https://example.test/destination?a=1&b=2',
                    target: '_blank',
                    title: '資料 "案内"',
                  },
                },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: '同じタブ',
              marks: [
                { type: 'link', attrs: { href: 'https://example.test/same', target: '_self' } },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: '指定なし',
              marks: [{ type: 'link', attrs: { href: 'https://example.test/default' } }],
            },
          ],
        },
      ],
    });
  } finally {
    if (previous === undefined) delete process.env.CMS_BLOG_RELEASE_SNAPSHOT;
    else process.env.CMS_BLOG_RELEASE_SNAPSHOT = previous;
    await rm(directory, { recursive: true, force: true });
  }
  // Fulfil all destinations locally: the test never visits an external service.
  await context.route('https://example.test/**', (route) =>
    route.fulfill({
      contentType: 'text/html; charset=utf-8',
      body: route.request().url().endsWith('/start') ? html : '<p>到達</p>',
    }),
  );
  await page.goto('https://example.test/start');
  await expect(page.getByRole('link', { name: '別タブ', exact: true })).toHaveAttribute(
    'title',
    '資料 "案内"',
  );
  const popupPromise = page.waitForEvent('popup');
  await page.getByRole('link', { name: '別タブ', exact: true }).click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL('https://example.test/destination?a=1&b=2');
  expect(await popup.evaluate(() => window.opener === null)).toBe(true);
  expect(await popup.evaluate(() => document.referrer)).toBe('');
  await expect(page).toHaveURL('https://example.test/start');
  await popup.close();
  await page.getByRole('link', { name: '同じタブ', exact: true }).click();
  await expect(page).toHaveURL('https://example.test/same');
  await page.goto('https://example.test/start');
  await page.getByRole('link', { name: '指定なし', exact: true }).click();
  await expect(page).toHaveURL('https://example.test/default');
  expect(context.pages()).toHaveLength(1);
});
