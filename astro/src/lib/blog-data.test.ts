import { describe, expect, it } from 'vitest';

import {
  filterBlogByCategory,
  filterRecommendedBlog,
  filterWorkshopReportBlog,
  paginateBlogPosts,
  decodeWordPressSlug,
} from './blog-data';
import type { Blog } from '@/types/blog';

const post = (id: number, category: string, isRecommended = false): Blog => ({
  id,
  name: `post-${String(id)}`,
  title: `記事${String(id)}`,
  isRecommended,
  isWorkshopReport: id <= 2,
  published: '2026/08/10',
  thumbnail: false,
  categories: [{ name: category }],
  film_tags: false,
});

const posts = Array.from({ length: 12 }, (_, index) =>
  post(index + 1, index % 2 === 0 ? '制作日誌' : '雑木林コラム', index === 0),
);

describe('blog data', () => {
  it('10件ずつページ分割する', () => {
    expect(paginateBlogPosts(posts, 2)).toEqual({ posts: posts.slice(10), totalPages: 2 });
  });

  it('カテゴリとおすすめ記事を抽出する', () => {
    expect(filterBlogByCategory(posts, '制作日誌')).toHaveLength(6);
    expect(filterRecommendedBlog(posts)).toEqual([posts[0]]);
  });

  it('ワークショップレポートだけを抽出する', () => {
    expect(filterWorkshopReportBlog(posts)).toEqual(posts.slice(0, 2));
  });

  it('URLエンコードされたslugを戻す', () => {
    expect(decodeWordPressSlug('2020%e5%b9%b4')).toBe('2020年');
  });
});
