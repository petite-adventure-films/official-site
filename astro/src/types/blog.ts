import type { Tag } from './tag';

export type Blog = {
  id: number;
  name: string;
  title: string;
  content?: string;
  recommended: string;
  published: string;
  thumbnail: string | false;
  categories: Tag[];
  film_tags: Tag[] | false;
};

export type BlogNativePost = {
  id: number;
  tags: number[];
};

export type BlogTag = {
  id: number;
  name: string;
  slug: string;
  count: number;
};
