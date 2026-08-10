import { describe, expect, it } from 'vitest';
import { getYouTubeId } from './youtube';

describe('getYouTubeId', () => {
  const id = 'abcdefghijk';

  it.each([
    [id, id],
    [`https://www.youtube.com/watch?v=${id}`, id],
    [`https://youtu.be/${id}?feature=shared`, id],
    [`https://www.youtube.com/embed/${id}`, id],
    [`https://www.youtube-nocookie.com/embed/${id}`, id],
    [`https://www.youtube.com/shorts/${id}`, id],
  ])('%s から動画IDを取り出す', (value, expected) => {
    expect(getYouTubeId(value)).toBe(expected);
  });

  it('動画IDを取得できない値はnullを返す', () => {
    expect(getYouTubeId('https://example.com/video')).toBeNull();
  });
});
