import { expect, test } from 'vitest';
import { emptyDraft } from '../src/features/events/draft';
import { validateDraft } from './event-draft';
import { eventTextFields } from '../../packages/content-schema/event-text';

test('formatted event fields retain links and reject unsafe URLs, media, unknown attrs and excessive nesting', () => {
  const rich = { schemaVersion: 2, doc: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '案内', marks: [{ type: 'link', attrs: { href: 'https://example.com/?a=1&b=2', target: '_blank', title: '元の案内' } }] }] }] } };
  for (const field of eventTextFields) expect(validateDraft({ ...emptyDraft(), [field]: rich })).toBe(true);
  for (const node of [
    { type: 'text', text: '危険', marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }] },
    { type: 'text', text: '不明', attrs: { onclick: 'alert(1)' } },
    { type: 'assetImage', attrs: { assetId: 'test', alt: '' } },
  ]) {
    const invalid = structuredClone(rich);
    invalid.doc.content[0].content = [node as any];
    expect(validateDraft({ ...emptyDraft(), organizer: invalid })).toBe(false);
  }
  let nested: any = { type: 'paragraph' };
  for (let i = 0; i < 100; i++) nested = { type: 'blockquote', content: [nested] };
  expect(validateDraft({ ...emptyDraft(), notes: { schemaVersion: 2, doc: { type: 'doc', content: [nested] } } })).toBe(false);
});

test('draft validation preserves incomplete dates and hidden values', () => {
  for (const date of ['', '2026/1', '2026-02-30']) {
    const draft = { ...emptyDraft(), startDate: date, endDate: '2020-01-01', venue: '非表示の会場', formats: [] };
    expect(validateDraft(draft)).toBe(true);
    expect(draft.startDate).toBe(date);
  }
});
test('rejects wrong types, unknown fields and overlong values', () => {
  for (const values of [{ multiDay: 'yes' }, { title: 'a'.repeat(201) }, { notes: 'a'.repeat(20001) }, { unexpected: true }, { formats: ['other'] }]) {
    expect(validateDraft({ ...emptyDraft(), ...values })).toBe(false);
  }
});
