import type { EventText } from '../../../../packages/content-schema/event-text';
export type EventDraft = {
  title: string;
  // Omitted means the immutable content ID is used as the initial slug.
  slug?: string;
  startDate: string;
  endDate: string;
  timeDescription: EventText;
  venue: string;
  address: string;
  mapUrl: string;
  access: EventText;
  venueNotes: EventText;
  fee: EventText;
  organizer: EventText;
  notes: EventText;
  multiDay: boolean;
  formats: ('offline' | 'online' | 'unknown')[];
  status: 'normal' | 'postponed' | 'cancelled';
  filmTagIds: string[];
  eventTagIds: string[];
};
export function emptyDraft(): EventDraft {
  return {
    title: '',
    startDate: '',
    endDate: '',
    timeDescription: '',
    venue: '',
    address: '',
    mapUrl: '',
    access: '',
    venueNotes: '',
    fee: '',
    organizer: '',
    notes: '',
    multiDay: false, formats: ['offline'], status: 'normal', filmTagIds: [], eventTagIds: [],
  };
}
