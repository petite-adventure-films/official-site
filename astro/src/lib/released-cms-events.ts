import { readFile } from 'node:fs/promises';
import legacy from '../../data/wordpress-export.json';
import { parseCmsEvents } from './cms-events';
import type { EventSummary } from '../types/event';
export async function releasedCmsEvents() {
  const file = process.env.CMS_RELEASE_SNAPSHOT;
  if (!file) return [];
  return parseCmsEvents(JSON.parse(await readFile(file, 'utf8')), legacy.content.events);
}
export async function releasedEventSummaries(): Promise<EventSummary[]> {
  return (await releasedCmsEvents()).map((event) => ({
    id: event.payload.slug,
    title: event.payload.title,
    no: event.no,
    date_from: event.payload.startDate.replaceAll('-', '/'),
    date_to: event.payload.endDate?.replaceAll('-', '/') ?? '',
    status: ({ normal: '', postponed: '1', cancelled: '2' } as const)[event.payload.status],
    place: event.payload.venue ?? 'オンライン開催',
    film_tags: event.filmTags,
    event_tags: event.eventTags,
  }));
}
