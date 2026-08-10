import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Modal from './Modal';

describe('Modal', () => {
  afterEach(() => {
    cleanup();
    document.body.style.overflow = '';
  });

  it('shows custom content when open', () => {
    render(
      <Modal open onClose={() => {}} ariaLabel="資料画像">
        <p>任意の内容</p>
      </Modal>,
    );

    expect(screen.getByRole('dialog', { name: '資料画像' })).toBeTruthy();
    expect(screen.getByText('任意の内容')).toBeTruthy();
  });

  it('locks background scrolling while open and restores it when closed', () => {
    document.body.style.overflow = 'auto';
    const onClose = vi.fn();
    const { rerender } = render(
      <Modal open onClose={onClose} ariaLabel="資料画像">
        <p>内容</p>
      </Modal>,
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Modal open={false} onClose={onClose} ariaLabel="資料画像">
        <p>内容</p>
      </Modal>,
    );

    expect(document.body.style.overflow).toBe('auto');
  });

  it('requests closing from the backdrop', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} ariaLabel="資料画像">
        <p>内容</p>
      </Modal>,
    );

    fireEvent.click(screen.getByRole('dialog', { name: '資料画像' }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not request closing when the content is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} ariaLabel="資料画像">
        <p>内容</p>
      </Modal>,
    );

    fireEvent.click(screen.getByText('内容'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('requests closing from the fixed close button', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} ariaLabel="資料画像">
        <p>内容</p>
      </Modal>,
    );

    fireEvent.click(screen.getByRole('button', { name: '閉じる' }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('requests closing with Escape', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} ariaLabel="資料画像">
        <p>内容</p>
      </Modal>,
    );

    fireEvent(screen.getByRole('dialog', { name: '資料画像' }), new Event('cancel'));

    expect(onClose).toHaveBeenCalledOnce();
  });
});
