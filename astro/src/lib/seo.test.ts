import { describe, expect, it } from 'vitest';

import { SITE_DESCRIPTION } from '@/constants/seo';
import { createMetaDescription, toPlainText } from './seo';

describe('SEO helpers', () => {
  it('HTMLを検索結果用のプレーンテキストへ変換する', () => {
    expect(toPlainText('<p>映画&nbsp;<strong>紹介</strong> &amp; 上映</p>')).toBe(
      '映画 紹介 & 上映',
    );
  });

  it('長いdescriptionを指定文字数に収める', () => {
    expect(createMetaDescription('1234567890', 6)).toBe('12345…');
  });

  it('本文が空の場合はサイト共通descriptionを使う', () => {
    expect(createMetaDescription('')).toBe(SITE_DESCRIPTION);
  });
});
