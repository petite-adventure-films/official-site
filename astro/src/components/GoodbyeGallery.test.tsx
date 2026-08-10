import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import GoodbyeGallery, { type GoodbyeGalleryEntry } from './GoodbyeGallery';

const entries: GoodbyeGalleryEntry[] = [
  {
    year: 2013,
    month: 11,
    day: 13,
    images: [{ src: '/goodbye_20131113_1.jpg', alt: '2013年11月13日の写真' }],
  },
  {
    year: 2013,
    month: 11,
    day: 15,
    images: [{ src: '/goodbye_20131115_1.jpg', alt: '2013年11月15日の写真' }],
  },
  {
    year: 2014,
    month: 2,
    day: 15,
    images: [{ src: '/goodbye_20140215_1.jpg', alt: '2014年2月15日の写真' }],
  },
  {
    year: 2014,
    month: 9,
    day: 14,
    images: [
      { src: '/goodbye_20140914_1.jpg', alt: '2014年9月14日の1枚目' },
      { src: '/goodbye_20140914_2.jpg', alt: '2014年9月14日の2枚目' },
    ],
  },
];

describe('GoodbyeGallery', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows the first gallery by default', () => {
    render(<GoodbyeGallery entries={entries} />);

    expect(screen.getByRole('tab', { name: '2013' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByAltText('2013年11月13日の写真')).toBeTruthy();
  });

  it('selects the month, day, and gallery of the first entry in the selected year', async () => {
    const user = userEvent.setup();
    render(<GoodbyeGallery entries={entries} />);

    await user.click(screen.getByRole('tab', { name: '2014' }));

    expect(screen.getByRole('tab', { name: '2014' }).getAttribute('aria-selected')).toBe('true');
    const monthGrid = screen.getByRole('list');
    expect(within(monthGrid).getByRole('button', { name: /^2/ }).getAttribute('aria-pressed')).toBe(
      'true',
    );
    expect(screen.getByRole('button', { name: '15' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByAltText('2014年2月15日の写真')).toBeTruthy();
  });

  it('switches the carousel when a month and day are selected', async () => {
    const user = userEvent.setup();
    render(<GoodbyeGallery entries={entries} />);

    await user.click(screen.getByRole('tab', { name: '2014' }));
    await user.click(screen.getByRole('button', { name: /9/ }));

    const days = screen.getAllByRole('button', { name: '14' });
    await user.click(days[0]);

    expect(screen.getByAltText('2014年9月14日の1枚目')).toBeTruthy();
    expect(screen.getByRole('button', { name: '画像2' })).toBeTruthy();
  });

  it('disables months without photos in the selected year', async () => {
    const user = userEvent.setup();
    render(<GoodbyeGallery entries={entries} />);

    await user.click(screen.getByRole('tab', { name: '2014' }));

    const monthGrid = screen.getByRole('list');
    expect(within(monthGrid).getByRole('button', { name: /^1$/ }).hasAttribute('disabled')).toBe(
      true,
    );
    expect(within(monthGrid).getByRole('button', { name: /^2/ }).hasAttribute('disabled')).toBe(
      false,
    );
  });
});
