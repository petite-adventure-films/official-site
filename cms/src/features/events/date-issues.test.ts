import { expect, test } from 'vitest';
import { emptyDraft } from './draft';
import { dateIssues } from './date-issues';
test('date feedback does not normalize input or validate hidden end dates', () => {
  expect(dateIssues({ ...emptyDraft(), startDate: '2026/1' })).toHaveProperty('startDate');
  expect(dateIssues({ ...emptyDraft(), startDate: '2026-02-30' })).toHaveProperty('startDate');
  expect(dateIssues({ ...emptyDraft(), startDate: '2028/02/29', endDate: 'bad' })).toEqual({});
  expect(dateIssues({ ...emptyDraft(), startDate: '2026-12-30', endDate: '2026-01-01', multiDay: true })).toHaveProperty('endDate');
});
