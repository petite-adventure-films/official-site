import type { Tag } from './tag';

export type Blog = {
  id: number | string;
  cmsSlug?: string;
  name: string;
  title: string;
  content?: string;
  isRecommended: boolean;
  isWorkshopReport: boolean;
  published: string;
  thumbnail: string | false;
  categories: Tag[];
  film_tags: Tag[] | false;
};
