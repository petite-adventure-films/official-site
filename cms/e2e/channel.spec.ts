import { expect, test } from '@playwright/test';

test('channel retains video, production data and film through publication and restore', async ({
  page,
  request,
}) => {
  test.setTimeout(180_000);
  const title = `チャンネル受け入れ ${Date.now()}`;
  await page.goto('/cms/channel/new');
  const titleField = page.getByRole('textbox', {
    name: 'タイトル',
    exact: true,
  });
  const body = page.getByRole('textbox', { name: '本文', exact: true });
  await titleField.fill(title);
  await body.fill('講演の記録と紹介本文');
  const fields = {
    'YouTube ID': 'kwHsbFrH2EA',
    制作年: '2025',
    制作国: '日本',
    上映時間: '1:10:17',
  };
  for (const [name, value] of Object.entries(fields))
    await page.getByRole('textbox', { name, exact: true }).fill(value);
  const tags = await (await request.get('/api/tags')).json();
  const tag = tags.filmTags[0];
  await page.getByRole('button', { name: tag.name, exact: true }).click();
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('保存済み');
  const id = page.url().split('/').at(-2)!;
  const saved = await (await request.get(`/api/contents/${id}`)).json();
  await page.reload();
  for (const [name, value] of Object.entries(fields))
    await expect(page.getByRole('textbox', { name, exact: true })).toHaveValue(
      value,
    );
  await expect(body).toHaveText('講演の記録と紹介本文');
  await expect(
    page.getByRole('button', { name: tag.name, exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.screenshot({
    path: 'test-results/channel-editor-1440.png',
    fullPage: true,
  });
  async function publish() {
    await page.getByRole('button', { name: '公開', exact: true }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: '公開する', exact: true })
      .click();
    await expect
      .poll(
        async () => {
          const state = await (
            await request.get(`/api/contents/${id}/publication`)
          ).json();
          return state.operation?.state;
        },
        { timeout: 90_000 },
      )
      .toBe('succeeded');
    const link = page.getByRole('link', {
      name: '公開ページを見る',
      exact: true,
    });
    await expect(link).toBeVisible();
    return (await link.getAttribute('href'))!;
  }
  const url = await publish();
  expect(new URL(url).pathname).toMatch(/^\/channel\/[^/]+\/$/);
  const html = await (await request.get(url)).text();
  for (const value of [
    ...Object.values(fields),
    '講演の記録と紹介本文',
    tag.name,
  ])
    expect(html).toContain(value);
  expect(html).toContain('youtube-nocookie.com/embed/kwHsbFrH2EA');
  expect(html).toContain('PT1H10M17S');
  const listing = await (
    await request.get(new URL('/channel/', url).href)
  ).text();
  expect(listing).toContain(new URL(url).pathname);
  expect(listing).toContain(title);
  await page
    .getByRole('textbox', { name: '制作年', exact: true })
    .fill('復元前の制作年');
  await page.getByRole('button', { name: '公開履歴', exact: true }).click();
  await page.getByRole('button', { name: /公開済/ }).click();
  await page.getByRole('button', { name: 'この内容を下書きに戻す' }).click();
  const restored = await (await request.get(`/api/contents/${id}`)).json();
  expect(restored.payload).toEqual({
    ...saved.payload,
    slug: new URL(url).pathname.split('/')[2],
  });
  for (const name of ['制作年', '制作国', '上映時間'])
    await page.getByRole('textbox', { name, exact: true }).fill('');
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('保存済み');
  await page.reload();
  for (const name of ['制作年', '制作国', '上映時間'])
    await expect(page.getByRole('textbox', { name, exact: true })).toHaveValue(
      '',
    );
  expect(await (await request.get(url)).text()).toBe(html);
  await publish();
  await expect
    .poll(
      async () =>
        (
          await (await request.get(`/api/contents/${id}/history`)).json()
        ).items.filter((item: { kind: string }) => item.kind === 'publication')
          .length,
    )
    .toBe(2);
  const missing = await (await request.get(url)).text();
  expect(missing).toContain('youtube-nocookie.com/embed/kwHsbFrH2EA');
  expect(missing).toContain('講演の記録と紹介本文');
  expect(missing).not.toContain('PT1H10M17S');
  expect(missing).not.toContain('1:10:17');
});
