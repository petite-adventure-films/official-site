export type EventDraft = {
  title: string;
  startDate: string;
  endDate: string;
  timeDescription: string;
  venue: string;
  address: string;
  mapUrl: string;
  access: string;
  venueNotes: string;
  fee: string;
  organizer: string;
  notes: string;
  multiDay: boolean;
  formats: ('offline' | 'online')[];
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
