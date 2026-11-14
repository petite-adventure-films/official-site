import { validateDraft } from './event-draft';
import type { EventDraft } from '../src/features/events/draft';
import { calendarDate } from '../src/lib/calendar-date';
import { slugIssue } from '../src/features/content/slug';

// This is a public-data candidate, not a published record or deployment result.
export type EventPublication = {
  type: 'event'; payloadSchemaVersion: 'event-publication/v1';
  title: string; slug: string; startDate: string; endDate?: string;
  formats: EventDraft['formats']; status: EventDraft['status'];
  timeDescription: string; venueNotes: string; fee: string; organizer: string; notes: string;
  venue?: string; address?: string; mapUrl?: string; access?: string;
  filmTagIds: string[]; eventTagIds: string[];
};
export type PublicationIssue = {
  field: keyof EventDraft | '_schema'; code: 'invalid_shape' | 'required' | 'invalid_date' | 'date_order' | 'invalid_url' | 'invalid_slug' | 'unknown_tag' | 'url_reserved'; message: string;
};
export type PublicationResult = { ok: true; payload: EventPublication } | { ok: false; issues: PublicationIssue[] };
export function prepareEventPublication(input: unknown, context: {
  contentId: string; filmTagIds: ReadonlySet<string>; eventTagIds: ReadonlySet<string>;
}): PublicationResult {
  if (!validateDraft(input)) return { ok: false, issues: [{ field: '_schema', code: 'invalid_shape', message: '下書きのデータ形式を確認してください。' }] };
  const draft = input as EventDraft;
  const issues: PublicationIssue[] = [];
  const issue = (field: PublicationIssue['field'], code: PublicationIssue['code'], message: string) => issues.push({ field, code, message });
  if (!draft.title.trim()) issue('title', 'required', 'タイトルを入力してください。');
  if (!draft.formats.length) issue('formats', 'required', '開催形式を選択してください。');
  const startDate = calendarDate(draft.startDate);
  if (!startDate) issue('startDate', draft.startDate ? 'invalid_date' : 'required', '有効な開催日を入力してください。');
  const endDate = draft.multiDay ? calendarDate(draft.endDate) : null;
  if (draft.multiDay) {
    if (!endDate) issue('endDate', draft.endDate ? 'invalid_date' : 'required', '有効な終了日を入力してください。');
    else if (startDate && endDate < startDate) issue('endDate', 'date_order', '終了日は開催日以降にしてください。');
  }
  const slug = draft.slug ?? context.contentId;
  const slugError = slugIssue(slug);
  if (slugError) issue('slug', 'invalid_slug', slugError);
  const offline = draft.formats.includes('offline');
  if (offline) {
    if (!draft.venue.trim()) issue('venue', 'required', '会場名を入力してください。');
    if (draft.mapUrl) {
      try {
        const url = new URL(draft.mapUrl);
        if (!/^https?:\/\//i.test(draft.mapUrl) || /[\s\\\u0000-\u001f\u007f]/u.test(draft.mapUrl) ||
          !['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) throw new Error();
      } catch { issue('mapUrl', 'invalid_url', '地図URLは有効なhttpまたはhttpsのURLを入力してください。'); }
    }
  }
  for (const field of ['filmTagIds', 'eventTagIds'] as const) {
    if (draft[field].some(id => !context[field].has(id))) issue(field, 'unknown_tag', '存在しないタグが含まれています。選び直してください。');
  }
  if (issues.length) return { ok: false, issues };
  // Explicit allowlist: hidden fields, author metadata and future draft fields cannot leak.
  return { ok: true, payload: {
    type: 'event', payloadSchemaVersion: 'event-publication/v1', title: draft.title, slug,
    startDate: startDate!, ...(draft.multiDay ? { endDate: endDate! } : {}),
    formats: [...draft.formats], status: draft.status, timeDescription: draft.timeDescription,
    ...(offline ? { venue: draft.venue, address: draft.address, mapUrl: draft.mapUrl, access: draft.access } : {}),
    venueNotes: draft.venueNotes, fee: draft.fee, organizer: draft.organizer, notes: draft.notes,
    filmTagIds: [...draft.filmTagIds], eventTagIds: [...draft.eventTagIds],
  } };
}
