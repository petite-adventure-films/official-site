import type { Tag } from './tag';

export type EventStatus = '' | '1' | '2';

type EventBase = {
  id: number;
  title: string;
  no: string | number;
  status: EventStatus;
  place: string;
  film_tags: Tag[] | false;
  event_tags: Tag[] | false;
};

export type EventSummary = EventBase & {
  date_to: string;
  date_from: string;
};

export type EventDetail = EventBase & {
  published: string;
  address: string;
  map: string;
  access_details: string;
  dates_details: string;
  fee_details: string;
  appendix_contents: string;
  host_details: string;
};

export type EventList = Record<string, Record<string, EventSummary[]>>;
