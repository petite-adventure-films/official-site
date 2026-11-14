import { expect, test } from 'vitest';
import { emptyDraft } from '../src/features/events/draft';
import { validateDraft } from './event-draft';

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
