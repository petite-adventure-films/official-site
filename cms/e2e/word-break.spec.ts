import { expect, test } from '@playwright/test';
import { emptyBlogDraft } from '../src/features/blog/draft';

test('preserves discretionary breaks when editing, reloading and duplicating and wraps only when needed', async ({ page, request }) => {
  const payload = { ...emptyBlogDraft(), title: '改行候補の保持' };
  payload.body.doc.content = [{ type: 'paragraph', content: [
    { type: 'text', text: 'abcdefghijkl' }, { type: 'wordBreak' }, { type: 'text', text: 'mnopqrstuvwx' },
  ] }];
  const response = await request.post('/api/contents', { headers: { Origin: 'http://127.0.0.1:5174' }, data: { type: 'blog', operationId: crypto.randomUUID(), payload } });
  expect(response.status()).toBe(201);
  const saved = await response.json();
  await page.goto(`/cms/blog/${saved.id}/edit`);
  const body = page.getByRole('textbox', { name: '本文', exact: true });
  await expect(body.locator('wbr')).toHaveCount(1);
  // Measure the actual editor's line layout, including its existing typography.
  const tops = async (width: number) => body.evaluate((el, width) => {
    const p = el.querySelector('p')!;
    p.style.width = `${width}px`;
    const wbr = p.querySelector('wbr')!;
    return [wbr.previousSibling!, wbr.nextSibling!].map(node => {
      const range = document.createRange(); range.setStart(node, 0); range.setEnd(node, 1);
      return range.getBoundingClientRect().top;
    });
  }, width);
  const wide = await tops(600); expect(wide[0]).toBe(wide[1]);
  const narrow = await tops(110); expect(narrow[1]).toBeGreaterThan(narrow[0]);
  await body.evaluate(el => el.querySelector('p')!.style.removeProperty('width'));
  await body.click(); await page.keyboard.press('ControlOrMeta+End'); await page.keyboard.insertText('追記');
  await expect(page.getByRole('status')).toHaveText('保存済み');
  await page.reload(); await expect(body).toContainText('追記'); await expect(body.locator('wbr')).toHaveCount(1);
  const original = await (await request.get(`/api/contents/${saved.id}`)).json();
  expect(original.payload.body.doc.content[0].content.map((n: any) => n.type === 'text' ? n.text : n.type))
    .toEqual(['abcdefghijkl', 'wordBreak', 'mnopqrstuvwx追記']);
  await page.getByRole('button', { name: '複製', exact: true }).click();
  await expect(page).not.toHaveURL(new RegExp(saved.id)); await expect(body.locator('wbr')).toHaveCount(1);
  const copyId = page.url().split('/').at(-2)!;
  expect((await (await request.get(`/api/contents/${copyId}`)).json()).payload.body).toEqual(original.payload.body);
  await page.screenshot({ path: 'test-results/word-break-editor.png', fullPage: true });
});
