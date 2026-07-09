import { describe, expect, it } from 'vitest';

import { buildPageItems } from './pager';

describe('buildPageItems', () => {
  it('returns no items when totalPages is zero', () => {
    expect(buildPageItems(1, 0)).toEqual([]);
  });

  it('returns all pages when there are no gaps', () => {
    expect(buildPageItems(2, 3)).toEqual([1, 2, 3]);
  });

  it('keeps first, last, current page, surrounding pages, and tenth pages', () => {
    expect(buildPageItems(15, 30)).toEqual([
      1,
      'ellipsis',
      10,
      'ellipsis',
      14,
      15,
      16,
      'ellipsis',
      20,
      'ellipsis',
      30,
    ]);
  });

  it('allows the interval pages to be configured', () => {
    expect(buildPageItems(8, 20, { interval: 5 })).toEqual([
      1,
      'ellipsis',
      5,
      'ellipsis',
      7,
      8,
      9,
      10,
      'ellipsis',
      15,
      'ellipsis',
      20,
    ]);
  });

  it('keeps the beginning compact when current page is near the first page', () => {
    expect(buildPageItems(1, 12)).toEqual([1, 2, 'ellipsis', 10, 'ellipsis', 12]);
  });

  it('keeps the end compact when current page is near the last page', () => {
    expect(buildPageItems(12, 12)).toEqual([1, 'ellipsis', 10, 11, 12]);
  });
});
