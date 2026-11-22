import { expect, test } from 'vitest';
import { parseVideoSource, validExternalVideo } from '../../packages/content-schema/external-video';
import { emptyBlogDraft } from '../src/features/blog/draft';
import { emptyArticleDraft, articleTypes } from '../src/features/articles/draft';
import { validateBlogDraft } from './blog-draft';
import { validateArticleDraft } from './article-draft';

const video = { ...parseVideoSource('https://www.youtube.com/embed/abcdefghijk?si=abc&start=12'), title: '動画', width: 560, height: 315 };
test('validates video identity and rejects mismatches, invalid dimensions and unknown attributes for every body type', () => {
  for (const attrs of [video, { ...video, videoId: 'other-id' }, { ...video, provider: 'vimeo' }, { ...video, width: 0 }, { ...video, height: 1.5 }, { ...video, srcdoc: '<script></script>' }]) {
    const good = attrs === video;
    expect(validExternalVideo(attrs)).toBe(good);
    const body = { schemaVersion: 2 as const, doc: { type: 'doc', content: [{ type: 'externalVideo', attrs }] } };
    expect(validateBlogDraft({ ...emptyBlogDraft(), body })).toBe(good);
    for (const type of articleTypes) expect(validateArticleDraft(type, { ...emptyArticleDraft(type), body })).toBe(good);
  }
});
