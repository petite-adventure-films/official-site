import type { Tag } from '~/types/tag';

export type Channel = {
  id: string;
  title: string;
  content: string;
  published: string;
  youtube_id: string;
  created_year: string;
  created_country: string;
  running_time: string;
  film_tags: Tag[] | false;
};
