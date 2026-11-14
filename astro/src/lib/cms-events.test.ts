import { describe, expect, it } from 'vitest';
import fixture from '../../fixtures/cms-events.json';
import { cmsEventStructuredData, parseCmsEvents, plainTextLinks, safeHttpUrl } from './cms-events';
const snapshot = () => structuredClone(fixture);
describe('CMS public event data', () => {
  it('reads plain text without HTML conversion and derives display numbers independently from slugs', () => {
    const events = parseCmsEvents(snapshot(), [{ id: 18010, published: '2020/01/01' }]);
    expect(events.map((event) => event.no)).toEqual([2, 3]);
    expect(events[0].payload.notes).toContain('<script>alert(1)</script>');
    expect(events[0].filmTags[0].name).toBe('検証用作品');
    expect(events[0].payload.slug).toBe('cms-sample-screening');
    const fewer = snapshot();
    fewer.events.shift();
    expect(parseCmsEvents(fewer, [])[0].no).toBe(1);
  });
  it('rejects private fields, invalid dates, missing tags and unsafe map URLs', () => {
    for (const patch of [
      { startDate: '2026-02-30' },
      { endDate: '2025-01-01' },
      { filmTagIds: ['missing'] },
      { mapUrl: 'javascript:alert(1)' },
      { mapUrl: 'https://user:password@example.com/' },
      { multiDay: true },
    ]) {
      const data = snapshot();
      Object.assign(data.events[0].payload, patch);
      expect(() => parseCmsEvents(data, [])).toThrow();
    }
    const privateData = { ...snapshot(), actor: 'private' };
    expect(() => parseCmsEvents(privateData, [])).toThrow();
  });
  it('rejects collisions with legacy pages, duplicate IDs, duplicate slugs and archive', () => {
    const data = snapshot();
    data.events[0].payload.slug = '18010';
    expect(() => parseCmsEvents(data, [{ id: 18010 }])).toThrow();
    for (const change of ['id', 'slug', 'archive'] as const) {
      const data = snapshot();
      if (change === 'id') data.events[1].id = data.events[0].id;
      else
        data.events[1].payload.slug =
          change === 'archive' ? 'archive' : data.events[0].payload.slug;
      expect(() => parseCmsEvents(data, [])).toThrow();
    }
  });
  it('uses explicit attendance/status and never invents an online location URL or organizer', () => {
    const events = parseCmsEvents(snapshot(), []);
    const mixed = cmsEventStructuredData(events[0], 'https://example.com/event/');
    expect(mixed.eventAttendanceMode).toBe('https://schema.org/MixedEventAttendanceMode');
    expect(mixed.location?.name).toBe('まちの交流室');
    const online = cmsEventStructuredData(events[1], 'https://example.com/online/');
    expect(online.eventStatus).toBe('https://schema.org/EventPostponed');
    expect(online.eventAttendanceMode).toBe('https://schema.org/OnlineEventAttendanceMode');
    expect(online).not.toHaveProperty('location');
    expect(online).not.toHaveProperty('organizer');
  });
});
describe('plain-text links', () => {
  it('keeps all text and newlines intact while linking only credential-free HTTP URLs', () => {
    const value =
      '案内\nhttps://example.com/contact。\njavascript:alert(1) <b>文字</b> https://user:pass@example.com/';
    const parts = plainTextLinks(value);
    expect(parts.map((part) => part.text).join('')).toBe(value);
    expect(parts.filter((part) => part.href).map((part) => part.href)).toEqual([
      'https://example.com/contact',
    ]);
    expect(safeHttpUrl('https://example.com/\\evil')).toBe(false);
    expect(safeHttpUrl('data:text/html,<script>')).toBe(false);
  });
});
