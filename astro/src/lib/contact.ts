export type ContactPayload = {
  name: string;
  email: string;
  message: string;
};

type ContactPayloadResult =
  { success: true; data: ContactPayload } | { success: false; error: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseContactPayload(value: unknown): ContactPayloadResult {
  if (!value || typeof value !== 'object') {
    return { success: false, error: '入力内容が正しくありません' };
  }

  const input = value as Record<string, unknown>;
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  const email = typeof input.email === 'string' ? input.email.trim() : '';
  const message = typeof input.message === 'string' ? input.message.trim() : '';

  if (name.length === 0 || name.length > 50) {
    return { success: false, error: '名前は1〜50文字で入力してください' };
  }
  if (email.length === 0 || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return { success: false, error: 'メールアドレスが正しくありません' };
  }
  if (message.length === 0 || message.length > 400) {
    return { success: false, error: 'お問い合わせ内容は1〜400文字で入力してください' };
  }

  return { success: true, data: { name, email, message } };
}

export function createContactEmailBody({ name, message }: ContactPayload): string {
  return `${name} 様

お問合せをいただき誠にありがとうございます。
お問合せいただきました内容は下記の通りです。ご確認ください。

------------
お問い合わせ内容
${message}
------------

担当者より後ほどご連絡をさせていただきます。
この度はお問合わせいただき誠にありがとうございました。

*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*

Petite Adventure Films（プチ・アドベンチャー・フィルムズ）
E-mail info@petiteadventurefilms.com
TEL 080-4146-3404（早川由美子）
Web https://www.petiteadventurefilms.com`;
}
