import type { Tag } from './tag';

type MediaBase = {
  id: number;
  title: string;
  published: string;
  media_name: string;
  media_volume: string;
  media_contents: string;
  film_tags: Tag[] | false;
};

export type MediaSummary = MediaBase;

export type MediaDetail = MediaBase & {
  content: string;
  media_video: string | false;
  media_pdf_url: string | false;
  article_title: string;
  article_subtitle: string;
  article_contents: string;
};
