import type { Tag } from '~/types/tag';

export type Media = {
  id: string;
  title: string;
  content: string;
  published: Date;
  updated: Date;
  media_name: string;
  media_volume: string;
  media_contents: string;
  media_video: string;
  media_pdf_url: string;
  article_title: string;
  article_subtitle: string;
  article_contents: string;
  film_tags: Tag[] | false;
};
