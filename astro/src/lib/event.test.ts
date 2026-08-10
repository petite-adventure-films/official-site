import { describe, expect, it } from 'vitest';
import { getLatestEvents, parseEventDate } from './event';
import type { EventList, EventSummary } from '@/types/event';

const makeEvent = (overrides: Partial<EventSummary> = {}): EventSummary => ({
  id: 1,
  title: '上映会',
  no: 1,
  status: '',
  date_from: '2026/10/24',
  date_to: '2027/01/30',
  place: '会場',
  film_tags: false,
  event_tags: false,
  ...overrides,
});

describe('parseEventDate', () => {
  it('WordPressの日付をローカル日付として解釈する', () => {
    const date = parseEventDate('2026/08/10');
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 7, 10]);
  });
});

describe('getLatestEvents', () => {
  it('月をまたいで各月に含まれるイベントを一件にまとめる', () => {
    const event = makeEvent();
    const grouped: EventList = {
      '2026': { '10': [event], '11': [event], '12': [event] },
      '2027': { '1': [event] },
    };

    expect(getLatestEvents(grouped, new Date(2026, 7, 10))).toEqual([event]);
  });

  it('終了日当日は最新イベントに残し、終了後は除外する', () => {
    const event = makeEvent({ date_from: '2026/08/01', date_to: '2026/08/10' });
    const grouped: EventList = { '2026': { '8': [event] } };

    expect(getLatestEvents(grouped, new Date(2026, 7, 10, 18))).toHaveLength(1);
    expect(getLatestEvents(grouped, new Date(2026, 7, 11))).toHaveLength(0);
  });

  it('開催日の昇順で並べる', () => {
    const later = makeEvent({ id: 2, date_from: '2026/12/01', date_to: '' });
    const sooner = makeEvent({ id: 1, date_from: '2026/09/01', date_to: '' });
    const grouped: EventList = { '2026': { '12': [later], '9': [sooner] } };

    expect(getLatestEvents(grouped, new Date(2026, 7, 10)).map(({ id }) => id)).toEqual([1, 2]);
  });
});
