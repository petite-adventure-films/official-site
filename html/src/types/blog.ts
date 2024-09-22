import type { Tag } from '~/types/tag';

export type Blog = {
  id: number;
  name: string;
  title: string;
  content: string;
  recommended: '1' | '0';
  published: string;
  thumbnail: string;
  categories: Tag[];
  film_tags: Tag[] | false;
};
