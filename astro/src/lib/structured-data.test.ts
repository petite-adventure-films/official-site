import { describe, expect, it } from 'vitest';
import {
  createBreadcrumbList,
  minutesToIsoDuration,
  serializeJsonLd,
  toIsoDate,
} from './structured-data';

describe('structured data helpers', () => {
  it('escapes script-like HTML in JSON-LD', () => {
    expect(serializeJsonLd({ name: '</script><script>alert(1)</script>' })).not.toContain('<');
  });

  it('normalizes WordPress dates', () => {
    expect(toIsoDate('2026/8/9')).toBe('2026-08-09');
    expect(toIsoDate('invalid')).toBeUndefined();
  });

  it('converts a running time to an ISO 8601 duration', () => {
    expect(minutesToIsoDuration('206分(上映版100分)')).toBe('PT206M');
    expect(minutesToIsoDuration('')).toBeUndefined();
  });

  it('creates numbered breadcrumb items', () => {
    const data = createBreadcrumbList([
      { name: 'HOME', url: 'https://example.com/' },
      { name: '映画', url: 'https://example.com/films/' },
    ]);
    expect(data.itemListElement).toEqual([
      {
        '@type': 'ListItem',
        position: 1,
        name: 'HOME',
        item: 'https://example.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '映画',
        item: 'https://example.com/films/',
      },
    ]);
  });
});

describe('channel duration notation', () => {
  it.each([
    ['62:32', 'PT62M32S'],
    ['1:10:17', 'PT1H10M17S'],
    ['08:15', 'PT8M15S'],
    ['00:00', 'PT0S'],
    ['1:00:00', 'PT1H'],
    ['20:00', 'PT20M'],
  ])('converts %s without changing the displayed text', (input, output) => {
    expect(minutesToIsoDuration(input)).toBe(output);
  });
  it.each(['1:60:00', '12:60', '未定', '1:2:3'])(
    'omits ambiguous or invalid duration %s',
    (input) => {
      expect(minutesToIsoDuration(input)).toBeUndefined();
    },
  );
});
