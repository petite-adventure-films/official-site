import { expect, test } from '@playwright/test';
import { emptyBlogDraft } from '../src/features/blog/draft';

test('preserves two video providers and access parameters through editing, reload and duplicate', async ({ page, request, context }) => {
  await context.route(/https:\/\/(www\.youtube\.com|player\.vimeo\.com)\//, route => route.fulfill({ contentType: 'text/html; charset=utf-8', body: '<p>動画プレーヤー検証用（通信をローカル応答に置換）</p>' }));
  const videos = [
    { provider: 'youtube', videoId: 'abcdefghijk', sourceUrl: 'https://www.youtube.com/embed/abcdefghijk?si=abc&start=12', title: '動画の題名', width: 560, height: 315 },
    { provider: 'vimeo', videoId: '50026595', sourceUrl: 'https://player.vimeo.com/video/50026595?h=abcdef1234', width: 640, height: 512 },
  ];
  const payload = { ...emptyBlogDraft(), title: '旧動画の保持' };
  payload.body.doc.content = [
    { type: 'paragraph', content: [{ type: 'text', text: '前の文章' }] },
    ...videos.map(attrs => ({ type: 'externalVideo', attrs })),
    { type: 'paragraph', content: [{ type: 'text', text: '後の文章' }] },
  ];
  const response = await request.post('/api/contents', { headers: { Origin: 'http://127.0.0.1:5174' }, data: { type: 'blog', operationId: crypto.randomUUID(), payload } });
  expect(response.status()).toBe(201);
  const saved = await response.json();
  await page.goto(`/cms/blog/${saved.id}/edit`);
  const body = page.getByRole('textbox', { name: '本文', exact: true });
  await expect(body.locator('iframe')).toHaveCount(2);
  for (let i = 0; i < videos.length; i++) await expect(body.locator('iframe').nth(i)).toHaveAttribute('src', videos[i].sourceUrl);
  await expect(body.locator('iframe').nth(1)).toHaveAttribute('title', 'Vimeo 動画');
  // Preserve the original aspect ratio when the editor becomes narrower.
  await body.evaluate(el => { el.style.width = '320px'; });
  const bounds = await body.locator('iframe').nth(1).boundingBox();
  expect(bounds!.width).toBeCloseTo(320, 0); expect(bounds!.height).toBeCloseTo(256, 0);
  await body.evaluate(el => { el.style.removeProperty('width'); });
  await body.locator('p').last().click(); await page.keyboard.press('End'); await page.keyboard.insertText('追記');
  await expect(page.getByRole('status')).toHaveText('保存済み');
  await page.reload(); await expect(body).toContainText('後の文章追記');
  await expect(body.locator('iframe')).toHaveCount(2);
  const original = await (await request.get(`/api/contents/${saved.id}`)).json();
  expect(original.payload.body.doc.content.filter((node: any) => node.type === 'externalVideo').map((node: any) => node.attrs)).toEqual(videos);
  await page.getByRole('button', { name: '複製', exact: true }).click();
  await expect(page).not.toHaveURL(new RegExp(saved.id)); await expect(body.locator('iframe')).toHaveCount(2);
  const copyId = page.url().split('/').at(-2)!;
  expect((await (await request.get(`/api/contents/${copyId}`)).json()).payload.body).toEqual(original.payload.body);
  expect((await (await request.get(`/api/contents/${saved.id}`)).json()).payload.body).toEqual(original.payload.body);
  await page.screenshot({ path: 'test-results/external-video-editor.png', fullPage: true });
});
