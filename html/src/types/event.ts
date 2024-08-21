import type { Tag } from '~/types/tag';
import type { EventStatus } from '~/types/event_status';

export type Event = {
  id: string;
  title: string;
  published: Date;
  updated?: Date;
  no: string;
  status: EventStatus;
  date_to: string;
  date_from: string;
  place: string;
  address: string;
  map: string;
  access_details: string;
  dates_details: string;
  fee_details: string;
  appendix_contents: string;
  host_details: string;
  film_tags: Tag[] | false;
  event_tags: Tag[] | false;
};

export type EventList = {
  [key: string]: {
    [key: string]: Event[];
  };
};
