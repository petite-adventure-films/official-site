import type { EventList, EventSummary } from '@/types/event';

export function parseEventDate(value: string): Date {
  const match = value.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (!match) return new Date(Number.NaN);

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export function getLatestEvents(groupedEvents: EventList, today = new Date()): EventSummary[] {
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const uniqueEvents = new Map<number, EventSummary>();

  for (const months of Object.values(groupedEvents)) {
    for (const events of Object.values(months)) {
      for (const event of events) uniqueEvents.set(event.id, event);
    }
  }

  return [...uniqueEvents.values()]
    .filter((event) => parseEventDate(event.date_to || event.date_from) >= startOfToday)
    .sort((a, b) => parseEventDate(a.date_from).getTime() - parseEventDate(b.date_from).getTime());
}
