import type { EventText } from '../event-text';
// Type companion to schemas/content/event-publication.schema.json.
export type EventPublication = {
  type: 'event'; payloadSchemaVersion: 'event-publication/v1';
  title: string; slug: string; startDate: string; endDate?: string;
  formats: ('offline' | 'online' | 'unknown')[]; status: 'normal' | 'postponed' | 'cancelled';
  timeDescription: EventText; venueNotes: EventText; fee: EventText; organizer: EventText; notes: EventText;
  venue?: string; address?: string; mapUrl?: string; access?: EventText;
  filmTagIds: string[]; eventTagIds: string[];
};
