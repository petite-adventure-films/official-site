import { test, expect } from '@playwright/test';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readCmsRelease } from '../src/lib/released-cms-blogs';
import { parseVideoSource } from '../../packages/content-schema/external-video';

test('published video frames preserve URLs, titles and aspect ratios within a narrow article', async ({
  page,
  context,
}) => {
  const directory = await mkdtemp(join(tmpdir(), 'paf-video-render-'));
  const previous = process.env.CMS_BLOG_RELEASE_SNAPSHOT;
  let html: string;
  const videos = [
    {
      ...parseVideoSource('https://www.youtube.com/embed/abcdefghijk?start=12&si=abc'),
      title: '動画の題名',
      width: 560,
      height: 315,
    },
    {
      ...parseVideoSource('https://player.vimeo.com/video/50026595?h=abcdef1234'),
      width: 640,
      height: 512,
    },
  ];
  try {
    const file = join(directory, 'release.json');
    await writeFile(file, JSON.stringify({ blogs: [], assets: [] }));
    process.env.CMS_BLOG_RELEASE_SNAPSHOT = file;
    const { render } = await readCmsRelease();
    html = render({
      type: 'doc',
      content: videos.map((attrs) => ({ type: 'externalVideo', attrs })),
    });
  } finally {
    if (previous === undefined) delete process.env.CMS_BLOG_RELEASE_SNAPSHOT;
    else process.env.CMS_BLOG_RELEASE_SNAPSHOT = previous;
    await rm(directory, { recursive: true, force: true });
  }
  await context.route(/https:\/\/(www\.youtube\.com|player\.vimeo\.com)\//, (route) =>
    route.fulfill({ contentType: 'text/html; charset=utf-8', body: '<p>動画プレーヤー検証用</p>' }),
  );
  await page.setContent(`<main style="width:320px">${html}</main>`);
  for (let i = 0; i < videos.length; i++) {
    const iframe = page.locator('iframe').nth(i);
    await expect(iframe).toHaveAttribute('src', videos[i].sourceUrl);
    const bounds = await iframe.boundingBox();
    if (!bounds) throw new Error('missing_video_bounds');
    expect(bounds.width).toBeCloseTo(320, 0);
    expect(bounds.height).toBeCloseTo((320 * videos[i].height) / videos[i].width, 0);
    await expect(iframe).toHaveAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  }
  await expect(page.locator('iframe').nth(0)).toHaveAttribute('title', '動画の題名');
  await expect(page.locator('iframe').nth(1)).toHaveAttribute('title', 'Vimeo 動画');
});
