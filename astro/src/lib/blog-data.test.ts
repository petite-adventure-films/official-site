import { describe, expect, it } from 'vitest';

import {
  decodeBlogTagSlug,
  filterBlogByCategory,
  filterBlogByTag,
  filterRecommendedBlog,
  paginateBlogPosts,
  decodeWordPressSlug,
  type BlogSnapshot,
} from './blog-data';
import type { Blog } from '@/types/blog';

const post = (id: number, category: string, recommended = '0'): Blog => ({
  id,
  name: `post-${String(id)}`,
  title: `記事${String(id)}`,
  recommended,
  published: '2026/08/10',
  thumbnail: false,
  categories: [{ name: category }],
  film_tags: false,
});

const posts = Array.from({ length: 12 }, (_, index) =>
  post(index + 1, index % 2 === 0 ? '制作日誌' : '雑木林コラム', index === 0 ? '1' : '0'),
);

describe('blog data', () => {
  it('10件ずつページ分割する', () => {
    expect(paginateBlogPosts(posts, 2)).toEqual({ posts: posts.slice(10), totalPages: 2 });
  });

  it('カテゴリとおすすめ記事を抽出する', () => {
    expect(filterBlogByCategory(posts, '制作日誌')).toHaveLength(6);
    expect(filterRecommendedBlog(posts)).toEqual([posts[0]]);
  });

  it('WordPressタグIDで記事を抽出する', () => {
    const snapshot: BlogSnapshot = {
      posts,
      tags: [],
      postTagIds: new Map([
        [1, [10]],
        [2, [20]],
      ]),
    };
    expect(filterBlogByTag(snapshot, 10)).toEqual([posts[0]]);
  });

  it('URLエンコードされたタグslugを戻す', () => {
    expect(decodeBlogTagSlug('%e6%98%a0%e5%83%8f')).toBe('映像');
    expect(decodeWordPressSlug('2020%e5%b9%b4')).toBe('2020年');
  });
});
