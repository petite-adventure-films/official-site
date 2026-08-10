import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import ContactForm, { validateContactForm } from './ContactForm';

afterEach(() => {
  cleanup();
});

describe('validateContactForm', () => {
  it('uses the same validation rules as the existing contact form', () => {
    expect(
      validateContactForm({
        name: '',
        email: 'invalid',
        emailConfirm: 'other@example.com',
        message: '',
      }),
    ).toEqual({
      name: '必須項目です',
      email: 'メールアドレスの形式が正しくありません',
      emailConfirm: 'メールアドレスが一致していません',
      message: '必須項目です',
    });
  });
});

describe('ContactForm', () => {
  it('enables confirmation only after valid values are entered', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const confirmButton = screen.getByRole('button', { name: '内容を確認する' });
    expect(confirmButton.hasAttribute('disabled')).toBe(true);

    await user.type(screen.getByLabelText('名前'), '山田太郎');
    await user.type(
      screen.getByLabelText('メールアドレス', { selector: '#contact-email' }),
      'a@example.com',
    );
    await user.type(screen.getByLabelText('メールアドレス確認'), 'a@example.com');
    await user.type(screen.getByLabelText('お問い合わせ内容'), 'お問い合わせです。');

    expect(confirmButton.hasAttribute('disabled')).toBe(false);
    await user.click(confirmButton);

    expect(screen.getByRole('button', { name: '送信する' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '内容を編集する' })).toBeTruthy();
    expect(screen.getByLabelText('名前').hasAttribute('disabled')).toBe(true);
  });

  it('shows a validation message after leaving an invalid field', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const email = screen.getByLabelText('メールアドレス', { selector: '#contact-email' });
    await user.type(email, 'invalid');
    await user.tab();

    expect(screen.getByRole('alert').textContent).toBe('メールアドレスの形式が正しくありません');
  });
});
