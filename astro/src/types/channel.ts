import type { Tag } from './tag';

type ChannelBase = {
  id: number | string;
  cmsPath?: string;
  cmsMarker?: string;
  title: string;
  published: string;
  youtube_id: string;
  created_year: string;
  created_country: string;
  running_time: string;
  film_tags: Tag[] | false;
};

export type ChannelSummary = ChannelBase;

export type ChannelDetail = ChannelBase & {
  content: string;
};
