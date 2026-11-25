import { eventTextFields, validEventText } from '../../../packages/content-schema/event-text';
import eventTextSchema from '../../../packages/content-schema/schemas/content/event-text.schema.json';
import Ajv from 'ajv/dist/2020';
import snapshotSchema from '../../../packages/content-schema/schemas/cms-events.schema.json';
import eventSchema from '../../../packages/content-schema/schemas/content/event-publication.schema.json';
import { slugIssue } from '../../../cms/src/features/content/slug';
import type {
  CmsEventRecord,
  CmsEventTag as Tag,
  CmsEventSnapshot,
} from '../../../packages/content-schema/types/cms-events';
export type {
  CmsEventRecord,
  CmsEventSnapshot,
} from '../../../packages/content-schema/types/cms-events';
export type CmsEventView = CmsEventRecord & { no: number; filmTags: Tag[]; eventTags: Tag[] };
const ajv = new Ajv({ strictTypes: false });
ajv.addSchema(eventTextSchema);
ajv.addSchema(eventSchema);
const validate = ajv.compile<CmsEventSnapshot>(snapshotSchema);
export function safeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      /^https?:\/\//i.test(value) &&
      !/[\s\\\u0000-\u001f\u007f]/u.test(value) &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}
function validDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    Number.isFinite(date.valueOf()) &&
    date.toISOString().slice(0, 10) === value &&
    !value.startsWith('0000')
  );
}
function requiredTag(tags: Tag[], id: string): Tag {
  const tag = tags.find((item) => item.id === id);
  if (!tag) throw new Error('Missing CMS tag');
  return tag;
}
export function parseCmsEvents(
  input: unknown,
  legacy: { id: number; published?: string }[],
): CmsEventView[] {
  if (!validate(input)) throw new Error('Invalid CMS event snapshot');
  const snapshot = input;
  for (const tags of [snapshot.filmTags, snapshot.eventTags])
    if (new Set(tags.map((tag) => tag.id)).size !== tags.length)
      throw new Error('Duplicate tag ID');
  const ids = new Set<string>();
  const slugs = new Set(legacy.map((event) => String(event.id)));
  for (const event of snapshot.events) {
    const payload = event.payload;
    if (
      !eventTextFields.every(
        (field) => payload[field] === undefined || validEventText(payload[field]),
      )
    )
      throw new Error('Invalid CMS event text');
    if (ids.has(event.id) || slugs.has(payload.slug) || slugIssue(payload.slug))
      throw new Error('Duplicate or reserved CMS event URL');
    ids.add(event.id);
    slugs.add(payload.slug);
    if (
      !validDate(payload.startDate) ||
      (payload.endDate && (!validDate(payload.endDate) || payload.endDate < payload.startDate)) ||
      !Number.isFinite(Date.parse(event.publishedAt)) ||
      new Date(event.publishedAt).toISOString() !==
        event.publishedAt.replace(/Z$/, event.publishedAt.includes('.') ? 'Z' : '.000Z')
    )
      throw new Error('Invalid CMS event date');
    if (payload.mapUrl && !safeHttpUrl(payload.mapUrl)) throw new Error('Invalid map URL');
    for (const [references, tags] of [
      [payload.filmTagIds, snapshot.filmTags],
      [payload.eventTagIds, snapshot.eventTags],
    ] as const) {
      if (references.some((id) => !tags.some((tag) => tag.id === id)))
        throw new Error('Missing CMS tag');
    }
  }
  // Display numbers are derived from the entire local published set, never used as URL IDs.
  const all = [
    ...legacy.map((event) => ({
      key: `legacy:${String(event.id)}`,
      at: Date.parse(`${event.published?.replaceAll('/', '-') ?? '1970-01-01'}T00:00:00+09:00`),
    })),
    ...snapshot.events.map((event) => ({
      key: `cms:${event.id}`,
      at: Date.parse(event.publishedAt),
    })),
  ];
  all.sort((a, b) => a.at - b.at || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  return snapshot.events.map((event) => ({
    ...event,
    no: all.findIndex((item) => item.key === `cms:${event.id}`) + 1,
    filmTags: event.payload.filmTagIds.map((id) => requiredTag(snapshot.filmTags, id)),
    eventTags: event.payload.eventTagIds.map((id) => requiredTag(snapshot.eventTags, id)),
  }));
}
export function plainTextLinks(value: string): { text: string; href?: string }[] {
  const parts: { text: string; href?: string }[] = [];
  let cursor = 0;
  for (const match of value.matchAll(/https?:\/\/[^\s<>"']+/gi)) {
    const text = match[0].replace(/[。、.,!?！？）)\]】」』]+$/u, '');
    if (!text || !safeHttpUrl(text)) continue;
    parts.push({ text: value.slice(cursor, match.index) }, { text, href: text });
    cursor = match.index + text.length;
  }
  parts.push({ text: value.slice(cursor) });
  return parts;
}
export function cmsEventStructuredData(event: CmsEventView, url: string) {
  const p = event.payload;
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': `${url}#event`,
    name: p.title,
    url,
    startDate: p.startDate,
    endDate: p.endDate ?? p.startDate,
    eventStatus: {
      normal: 'https://schema.org/EventScheduled',
      postponed: 'https://schema.org/EventPostponed',
      cancelled: 'https://schema.org/EventCancelled',
    }[p.status],
    ...(!p.formats.includes('unknown')
      ? {
          eventAttendanceMode:
            p.formats.length === 2
              ? 'https://schema.org/MixedEventAttendanceMode'
              : p.formats[0] === 'online'
                ? 'https://schema.org/OnlineEventAttendanceMode'
                : 'https://schema.org/OfflineEventAttendanceMode',
        }
      : {}),
    ...(p.formats.includes('offline')
      ? {
          location: {
            '@type': 'Place',
            name: p.venue,
            ...(p.address
              ? { address: { '@type': 'PostalAddress', streetAddress: p.address } }
              : {}),
          },
        }
      : {}),
    inLanguage: 'ja-JP',
  };
}
