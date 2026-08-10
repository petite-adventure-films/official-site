import { describe, expect, it } from 'vitest';

import { createContactEmailBody, parseContactPayload } from './contact';

describe('parseContactPayload', () => {
  it('trims and accepts valid input', () => {
    expect(
      parseContactPayload({
        name: ' 山田太郎 ',
        email: ' user@example.com ',
        message: ' お問い合わせです。 ',
      }),
    ).toEqual({
      success: true,
      data: {
        name: '山田太郎',
        email: 'user@example.com',
        message: 'お問い合わせです。',
      },
    });
  });

  it('rejects malformed or oversized input', () => {
    expect(parseContactPayload(null).success).toBe(false);
    expect(parseContactPayload({ name: '', email: 'invalid', message: '' }).success).toBe(false);
    expect(
      parseContactPayload({
        name: '山田太郎',
        email: 'user@example.com',
        message: 'あ'.repeat(401),
      }).success,
    ).toBe(false);
  });
});

describe('createContactEmailBody', () => {
  it('includes all submitted values', () => {
    const body = createContactEmailBody({
      name: '山田太郎',
      email: 'user@example.com',
      message: 'お問い合わせです。',
    });

    expect(body).toContain('山田太郎 様');
    expect(body).toContain('お問い合わせです。');
    expect(body).toContain('Petite Adventure Films');
  });
});
