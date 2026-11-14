// Type companion to schemas/content/event-publication.schema.json.
export type EventPublication = {
  type: 'event'; payloadSchemaVersion: 'event-publication/v1';
  title: string; slug: string; startDate: string; endDate?: string;
  formats: ('offline' | 'online')[]; status: 'normal' | 'postponed' | 'cancelled';
  timeDescription: string; venueNotes: string; fee: string; organizer: string; notes: string;
  venue?: string; address?: string; mapUrl?: string; access?: string;
  filmTagIds: string[]; eventTagIds: string[];
};
