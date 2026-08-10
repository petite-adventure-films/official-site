import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import MovementsGallery, { type MovementGalleryEntry } from './MovementsGallery';

const entries: MovementGalleryEntry[] = [
  {
    year: 2017,
    month: 12,
    images: [
      { src: '/movement-1.jpg', alt: '2017年12月の資料1', width: 640, height: 480 },
      { src: '/movement-2.jpg', alt: '2017年12月の資料2', width: 640, height: 480 },
    ],
  },
];

describe('MovementsGallery', () => {
  afterEach(cleanup);

  it('opens the selected image and clears it when closed', async () => {
    const user = userEvent.setup();
    render(<MovementsGallery entries={entries} />);

    await user.click(screen.getByRole('button', { name: '2017年12月の資料2を拡大表示' }));

    expect(screen.getByRole('dialog', { name: '高幡台団地の今の資料画像' })).toBeTruthy();
    expect(screen.getByAltText('2017年12月の資料2')).toBeTruthy();

    fireEvent.click(screen.getByRole('dialog', { name: '高幡台団地の今の資料画像' }));

    expect(screen.queryByRole('dialog', { name: '高幡台団地の今の資料画像' })).toBeNull();
    expect(screen.queryByAltText('2017年12月の資料2')).toBeNull();
  });

  it('shows the newly selected image after reopening', async () => {
    const user = userEvent.setup();
    render(<MovementsGallery entries={entries} />);

    await user.click(screen.getByRole('button', { name: '2017年12月の資料1を拡大表示' }));
    fireEvent.click(screen.getByRole('dialog', { name: '高幡台団地の今の資料画像' }));
    await user.click(screen.getByRole('button', { name: '2017年12月の資料2を拡大表示' }));

    expect(screen.getByAltText('2017年12月の資料2')).toBeTruthy();
    expect(screen.queryByAltText('2017年12月の資料1')).toBeNull();
  });
});
