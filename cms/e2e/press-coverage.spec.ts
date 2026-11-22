import { expect, test } from '@playwright/test';

// Isolated local CMS/release runner only. No hosted publication or mail.
test('press coverage retains source, excerpt, PDF, video and film through publication and restore', async ({
  page,
  request,
}) => {
  test.setTimeout(180_000);
  const title = `メディア掲載受け入れ ${Date.now()}`;
  const pdf = Buffer.from(
    '%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\n%%EOF\n',
  );
  await page.goto('/cms/media/new');
  const titleField = page.getByRole('textbox', {
    name: 'タイトル',
    exact: true,
  });
  await titleField.fill(title);
  const fields = {
    掲載元: '確認新聞',
    '掲載号・掲載日': '2026年11月号',
    掲載種別: 'インタビュー',
    'YouTube ID': 'ZU63qN0aR_E',
    掲載記事の見出し: '取材記事の見出し',
    掲載記事の副見出し: '取材記事の副見出し',
  };
  for (const [name, value] of Object.entries(fields))
    await page.getByRole('textbox', { name, exact: true }).fill(value);
  const bodies = page.getByRole('textbox', { name: '本文', exact: true });
  await expect(bodies).toHaveCount(2);
  await bodies.nth(0).fill('掲載記事の引用本文');
  await bodies.nth(1).fill('監督からの紹介本文');
  const tags = await (await request.get('/api/tags')).json();
  const tag = tags.filmTags[0];
  await page.getByRole('button', { name: tag.name, exact: true }).click();
  await page.getByRole('button', { name: 'PDFを選択', exact: true }).click();
  await page.getByLabel('登録するファイル').setInputFiles({
    name: 'coverage.pdf',
    mimeType: 'application/pdf',
    buffer: pdf,
  });
  await page.getByRole('button', { name: '登録', exact: true }).click();
  await page.getByRole('button', { name: '挿入', exact: true }).click();
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('保存済み');
  const id = page.url().split('/').at(-2)!;
  const saved = await (await request.get(`/api/contents/${id}`)).json();
  expect(saved.payload.filmTagIds).toContain(tag.id);
  expect(saved.payload.attachmentAssetIds).toHaveLength(1);
  await page.reload();
  for (const [name, value] of Object.entries(fields))
    await expect(page.getByRole('textbox', { name, exact: true })).toHaveValue(
      value,
    );
  await expect(bodies.nth(0)).toHaveText('掲載記事の引用本文');
  await expect(bodies.nth(1)).toHaveText('監督からの紹介本文');
  await page.screenshot({
    path: 'test-results/press-editor-1440.png',
    fullPage: true,
  });
  await page.getByRole('button', { name: '公開', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: '公開する', exact: true })
    .click();
  const link = page.getByRole('link', {
    name: '公開ページを見る',
    exact: true,
  });
  await expect(link).toBeVisible({ timeout: 90_000 });
  const url = (await link.getAttribute('href'))!;
  expect(new URL(url).pathname).toMatch(/^\/media\/[^/]+\/$/);
  const html = await (await request.get(url)).text();
  for (const value of [
    ...Object.values(fields),
    '掲載記事の引用本文',
    '監督からの紹介本文',
    tag.name,
  ])
    expect(html).toContain(value);
  expect(html).toContain('youtube-nocookie.com/embed/ZU63qN0aR_E');
  // Check the actual published PDF URL rather than the authenticated CMS URL.
  const pdfUrl = html.match(/(?:src|href)="([^"]+\.pdf)"/)?.[1];
  expect(pdfUrl).toBeTruthy();
  expect(await (await request.get(new URL(pdfUrl!, url).href)).body()).toEqual(
    pdf,
  );
  await page
    .getByRole('textbox', { name: '掲載元', exact: true })
    .fill('復元前の出典');
  await page.getByRole('button', { name: '公開履歴', exact: true }).click();
  await page.getByRole('button', { name: /公開済/ }).click();
  await page.getByRole('button', { name: 'この内容を下書きに戻す' }).click();
  const restored = await (await request.get(`/api/contents/${id}`)).json();
  expect(restored.payload).toEqual({
    ...saved.payload,
    slug: new URL(url).pathname.split('/')[2],
  });
  await page.getByRole('textbox', { name: '掲載元', exact: true }).fill('');
  await page
    .getByRole('textbox', { name: '掲載号・掲載日', exact: true })
    .fill('');
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('保存済み');
  await page.reload();
  await expect(
    page.getByRole('textbox', { name: '掲載元', exact: true }),
  ).toHaveValue('');
  expect(await (await request.get(url)).text()).toBe(html);
});
