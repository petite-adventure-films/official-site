import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ImageCarousel, { type ImageCarouselImage } from './ImageCarousel';

const images: ImageCarouselImage[] = [
  { src: '/images/one.jpg', alt: '1枚目の写真' },
  { src: '/images/two.jpg', alt: '2枚目の写真' },
  { src: '/images/three.jpg', alt: '3枚目の写真' },
];

const otherImages: ImageCarouselImage[] = [
  { src: '/images/other-one.jpg', alt: '別セットの1枚目' },
  { src: '/images/other-two.jpg', alt: '別セットの2枚目' },
  { src: '/images/other-three.jpg', alt: '別セットの3枚目' },
];

const activeItems = () =>
  Array.from(document.querySelectorAll('[data-carousel-item]')).filter(
    (item) => item.getAttribute('data-active') === 'true',
  );

describe('ImageCarousel', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('renders the images passed from outside', () => {
    render(<ImageCarousel images={images} ariaLabel="テスト写真" />);

    expect(screen.getByRole('region', { name: 'テスト写真' })).toBeTruthy();
    expect(screen.getByAltText('1枚目の写真')).toBeTruthy();
    expect(screen.getByAltText('2枚目の写真')).toBeTruthy();
    expect(screen.getByAltText('3枚目の写真')).toBeTruthy();
  });

  it('moves to the next and previous image', async () => {
    const user = userEvent.setup();
    render(<ImageCarousel images={images} ariaLabel="テスト写真" />);

    await user.click(screen.getByRole('button', { name: '次の画像' }));
    expect(activeItems()[0]?.contains(screen.getByAltText('2枚目の写真'))).toBe(true);

    await user.click(screen.getByRole('button', { name: '前の画像' }));
    expect(activeItems()[0]?.contains(screen.getByAltText('1枚目の写真'))).toBe(true);
  });

  it('marks the active bullet with aria-current', async () => {
    const user = userEvent.setup();
    render(<ImageCarousel images={images} ariaLabel="テスト写真" />);

    await user.click(screen.getByRole('button', { name: '画像3' }));

    expect(screen.getByRole('button', { name: '画像3' }).getAttribute('aria-current')).toBe('true');
    expect(screen.getByRole('button', { name: '画像1' }).hasAttribute('aria-current')).toBe(false);
  });

  it('resets the active image when the image set changes', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ImageCarousel images={images} ariaLabel="テスト写真" />);

    await user.click(screen.getByRole('button', { name: '画像3' }));
    expect(activeItems()[0]?.contains(screen.getByAltText('3枚目の写真'))).toBe(true);

    rerender(<ImageCarousel images={otherImages} ariaLabel="テスト写真" />);

    await waitFor(() => {
      expect(activeItems()[0]?.contains(screen.getByAltText('別セットの1枚目'))).toBe(true);
    });
  });

  it('loops from the last image to the first image', async () => {
    const user = userEvent.setup();
    render(<ImageCarousel images={images} ariaLabel="テスト写真" />);

    await user.click(screen.getByRole('button', { name: '画像3' }));
    await user.click(screen.getByRole('button', { name: '次の画像' }));

    expect(activeItems()[0]?.contains(screen.getByAltText('1枚目の写真'))).toBe(true);
  });

  it('stays at the last image when loop is disabled', async () => {
    const user = userEvent.setup();
    render(<ImageCarousel images={images} ariaLabel="テスト写真" loop={false} />);

    await user.click(screen.getByRole('button', { name: '画像3' }));
    await user.click(screen.getByRole('button', { name: '次の画像' }));

    expect(activeItems()[0]?.contains(screen.getByAltText('3枚目の写真'))).toBe(true);
  });

  it('changes the active image by swipe', () => {
    render(<ImageCarousel images={images} ariaLabel="テスト写真" />);
    const region = screen.getByRole('region', { name: 'テスト写真' });

    fireEvent.touchStart(region.firstElementChild as Element, {
      touches: [{ pageX: 100 }],
    });
    fireEvent.touchEnd(region.firstElementChild as Element, {
      changedTouches: [{ pageX: 20 }],
    });

    expect(activeItems()[0]?.contains(screen.getByAltText('2枚目の写真'))).toBe(true);
  });

  it('autoplays only when enabled', () => {
    vi.useFakeTimers();
    render(<ImageCarousel images={images} ariaLabel="テスト写真" autoplay />);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(activeItems()[0]?.contains(screen.getByAltText('2枚目の写真'))).toBe(true);
  });

  it('does not autoplay when autoplay is disabled', () => {
    vi.useFakeTimers();
    render(<ImageCarousel images={images} ariaLabel="テスト写真" autoplay={false} />);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(activeItems()[0]?.contains(screen.getByAltText('1枚目の写真'))).toBe(true);
  });

  it('continues autoplay after manual navigation', () => {
    vi.useFakeTimers();
    render(<ImageCarousel images={images} ariaLabel="テスト写真" autoplay />);

    fireEvent.click(screen.getByRole('button', { name: '次の画像' }));
    expect(activeItems()[0]?.contains(screen.getByAltText('2枚目の写真'))).toBe(true);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(activeItems()[0]?.contains(screen.getByAltText('3枚目の写真'))).toBe(true);
  });

  it('does not render bullets when showBullets is disabled', () => {
    render(<ImageCarousel images={images} ariaLabel="テスト写真" showBullets={false} />);

    expect(screen.queryByRole('button', { name: '画像1' })).toBeNull();
    expect(screen.getByRole('button', { name: '次の画像' })).toBeTruthy();
  });

  it('does not render navigation or bullets for one image', () => {
    render(<ImageCarousel images={[images[0]]} ariaLabel="テスト写真" />);

    expect(screen.queryByRole('button', { name: '次の画像' })).toBeNull();
    expect(screen.queryByRole('button', { name: '画像1' })).toBeNull();
  });

  it('renders nothing when images are empty', () => {
    const { container } = render(<ImageCarousel images={[]} ariaLabel="テスト写真" />);

    expect(container.innerHTML).toBe('');
  });
});
