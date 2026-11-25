import eventTextSchema from '../../packages/content-schema/schemas/content/event-text.schema.json';
import Ajv from 'ajv/dist/2020';
import { describe, expect, test } from 'vitest';
import schema from '../../packages/content-schema/schemas/content/event-publication.schema.json';
import { emptyDraft } from '../src/features/events/draft';
import { prepareEventPublication } from './event-publication';
const validate = new Ajv({ allErrors: true }).addSchema(eventTextSchema).compile(schema);
const context = { contentId: '9b081366-119c-4b37-ab1e-56b631b22222', filmTagIds: new Set(['film']), eventTagIds: new Set(['event']) };
const valid = () => ({ ...emptyDraft(), title: '上映会', startDate: '2026/12/30', venue: '会場', filmTagIds: ['film'], eventTagIds: ['event'] });
const prepare = (changes = {}) => prepareEventPublication({ ...valid(), ...changes }, context);

test('publication retains formatted text and does not share mutable nodes with the draft', () => {
  const organizer = { schemaVersion: 2, doc: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '問い合わせ', marks: [{ type: 'link', attrs: { href: 'https://example.com/', target: '_blank', title: '窓口' } }] }] }] } };
  const result = prepare({ organizer });
  expect(result.ok).toBe(true);
  if (!result.ok) throw Error();
  expect(validate(result.payload)).toBe(true);
  expect(result.payload.organizer).toEqual(organizer);
  expect(result.payload.organizer).not.toBe(organizer);
});

test('unknown attendance retains venue information without assuming a venue is required', () => {
  for (const status of ['normal', 'postponed', 'cancelled']) {
    const result = prepare({ formats: ['unknown'], status, venue: '', address: '旧住所', access: '旧アクセス', mapUrl: 'https://example.com/map' });
    expect(result.ok).toBe(true);
    if (!result.ok) throw Error();
    expect(result.payload).toMatchObject({ formats: ['unknown'], venue: '', address: '旧住所', access: '旧アクセス', mapUrl: 'https://example.com/map', status });
    expect(validate(result.payload), JSON.stringify(validate.errors)).toBe(true);
  }
  expect(prepare({ formats: ['unknown'], mapUrl: 'javascript:alert(1)' }).ok).toBe(false);
  for (const formats of [['unknown', 'offline'], ['online', 'unknown']]) {
    expect(prepare({ formats }).ok).toBe(false);
    const result = prepare();
    if (!result.ok) throw Error();
    expect(validate({ ...result.payload, formats })).toBe(false);
  }
  expect(prepare({ formats: [] }).ok).toBe(false);
});

test('collects field errors and never returns partially valid public data', () => {
  const draft = { ...emptyDraft(), slug: '', formats: [] };
  const before = structuredClone(draft);
  const result = prepareEventPublication(draft, context);
  expect(result.ok).toBe(false);
  if (result.ok) throw new Error();
  expect(result.issues.map(issue => issue.field)).toEqual(['title', 'formats', 'startDate', 'slug']);
  expect(result).not.toHaveProperty('payload'); expect(draft).toEqual(before);
});
test('preserves plain text, year-crossing dates, tags and original input', () => {
  const draft = { ...valid(), multiDay: true, endDate: '2027/01/03', notes: '<script>test</script>\n**文章**\nhttps://example.com', slug: 'custom-event' };
  Object.freeze(draft.filmTagIds); Object.freeze(draft.eventTagIds); Object.freeze(draft.formats); Object.freeze(draft);
  const result = prepareEventPublication(draft, context);
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error();
  expect(result.payload).toMatchObject({ startDate: '2026-12-30', endDate: '2027-01-03', slug: 'custom-event', notes: draft.notes });
  expect(validate(result.payload), JSON.stringify(validate.errors)).toBe(true);
  result.payload.filmTagIds.push('new'); result.payload.formats.push('online');
  expect(draft.filmTagIds).toEqual(['film']); expect(draft.formats).toEqual(['offline']);
  expect(draft.startDate).toBe('2026/12/30');
});
test('omits hidden fields and ignores their invalid values while retaining venue notes', () => {
  const draft = { ...valid(), formats: ['online'], endDate: 'not a date', venue: '', address: 'HIDDEN', access: 'HIDDEN', mapUrl: 'javascript:alert(1)', venueNotes: 'https://example.com/online' };
  const result = prepareEventPublication(draft, context);
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error();
  for (const key of ['endDate', 'venue', 'address', 'mapUrl', 'access', 'multiDay']) expect(result.payload).not.toHaveProperty(key);
  expect(result.payload.venueNotes).toBe(draft.venueNotes);
  expect(result.payload.slug).toBe(context.contentId);
  expect(validate(result.payload), JSON.stringify(validate.errors)).toBe(true);
  expect(draft.mapUrl).toBe('javascript:alert(1)');
});
describe('calendar validation', () => {
  test.each(['2026/1', '2026-02-29', '2026-04-31', '2026/12-30', '0000-01-01', '2026-01-01T00:00:00Z', ' 2026-01-01'])('rejects %s', (startDate) => {
    const result = prepare({ startDate });
    expect(result).toMatchObject({ ok: false, issues: [{ field: 'startDate', code: 'invalid_date' }] });
  });
  test('accepts leap day, same-day and year-crossing periods; rejects reversed and missing end dates', () => {
    expect(prepare({ startDate: '2024-02-29' }).ok).toBe(true);
    expect(prepare({ multiDay: true, endDate: '2026/12/30' }).ok).toBe(true);
    expect(prepare({ multiDay: true, endDate: '2026/12/29' })).toMatchObject({ ok: false, issues: [{ field: 'endDate', code: 'date_order' }] });
    expect(prepare({ multiDay: true })).toMatchObject({ ok: false, issues: [{ field: 'endDate', code: 'required' }] });
  });
});
test('offline and hybrid require a venue; blank optional fields are valid', () => {
  expect(prepare().ok).toBe(true);
  expect(prepare({ formats: ['offline', 'online'], venue: ' ' })).toMatchObject({ ok: false, issues: [{ field: 'venue', code: 'required' }] });
  const result = prepare({ formats: ['offline', 'online'] });
  expect(result.ok).toBe(true);
  if (result.ok) expect(validate(result.payload)).toBe(true);
});
test.each(['javascript:alert(1)', 'data:text/html,test', '//example.com', 'https://', 'https://user:password@example.com', 'https://example.com\n/path', 'https:\\example.com'])('rejects unsafe or malformed map URL %s', mapUrl => {
  expect(prepare({ mapUrl })).toMatchObject({ ok: false, issues: [{ field: 'mapUrl', code: 'invalid_url' }] });
});
test('accepts valid map URLs, preserves cancellation and postponement', () => {
  for (const status of ['cancelled', 'postponed']) {
    const result = prepare({ mapUrl: 'https://example.com/map?q=東京', status });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.payload.status).toBe(status);
  }
});
test('rejects unknown tag references without silently dropping them', () => {
  expect(prepare({ filmTagIds: ['event'], eventTagIds: ['film'] })).toMatchObject({ ok: false, issues: [{ field: 'filmTagIds', code: 'unknown_tag' }, { field: 'eventTagIds', code: 'unknown_tag' }] });
});
test.each(['archive', '../path', '', '\ud800'])('rejects invalid slug %s', slug => {
  expect(prepare({ slug })).toMatchObject({ ok: false, issues: [{ field: 'slug', code: 'invalid_slug' }] });
});
test.each([null, {}, { ...valid(), title: 1 }, { ...valid(), unexpected: true }, { ...valid(), formats: ['other'] }])('rejects malformed input before conversion', input => {
  expect(prepareEventPublication(input, context)).toMatchObject({ ok: false, issues: [{ field: '_schema', code: 'invalid_shape' }] });
});
