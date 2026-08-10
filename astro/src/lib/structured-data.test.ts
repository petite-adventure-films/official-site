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
