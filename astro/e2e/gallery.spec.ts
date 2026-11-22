import { expect, test } from '@playwright/test';

for (const path of ['/four-walling/', '/workshop/', '/films/goodbye_ur/', '/pafshop/goodbye_ur/']) {
  test(`${path} ギャラリーの表示画像と選択状態が一致する`, async ({ page }) => {
    await page.goto(path);
    const gallery = page.locator('.gallery-widget');
    const slides = gallery.locator('[data-gallery-item]');
    const selectors = gallery.getByRole('button', { name: /^画像\d+$/ });
    const count = await slides.count();
    expect(count).toBeGreaterThan(1);

    const checkSelection = async (index: number) => {
      await expect(gallery.locator('[data-gallery-item][aria-hidden="false"]')).toHaveCount(1);
      await expect(slides.nth(index)).toHaveAttribute('aria-hidden', 'false');
      await expect(slides.nth(index)).toHaveCSS('opacity', '1');
      await expect(gallery.getByRole('button', { pressed: true })).toHaveCount(1);
      await expect(selectors.nth(index)).toHaveAttribute('aria-pressed', 'true');
      if (path === '/four-walling/' || path === '/workshop/') {
        await expect(gallery.getByRole('img')).toHaveCount(1);
      }
    };

    await checkSelection(0);
    await gallery.getByRole('button', { name: '前の画像' }).click();
    await checkSelection(count - 1);
    await gallery.getByRole('button', { name: '次の画像' }).click();
    await checkSelection(0);
    await selectors.nth(1).focus();
    await page.keyboard.press('Enter');
    await checkSelection(1);
  });
}
