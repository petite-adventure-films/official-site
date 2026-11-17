import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validationSchema as contact } from '../src/constants/form_schema_contact.ts';
import { validationSchema as shop } from '../src/constants/form_schema_shop.ts';

const formEmail = {
  email: 'test@example.com',
  emailConfirm: 'test@example.com',
};
test('contact accepts valid input and retains submitted values', async () => {
  const input = {
    form: { name: '確認用', message: 'お問い合わせ' },
    formEmail,
  };
  assert.deepEqual(await contact.parse(input), { value: input, errors: [] });
});
test('contact preserves required, length and confirmation field errors', async () => {
  const { errors } = await contact.parse({
    form: { name: '', message: 'a'.repeat(401) },
    formEmail: { ...formEmail, emailConfirm: 'other@example.com' },
  });
  assert.deepEqual(errors, [
    { path: 'form.name', errors: ['必須項目です'] },
    { path: 'form.message', errors: ['400文字以内で入力してください'] },
    {
      path: 'formEmail.emailConfirm',
      errors: ['メールアドレスが一致していません'],
    },
  ]);
});
test('shop preserves address and telephone validation', async () => {
  const form = {
    name: '確認用',
    zipcode: '123-4567',
    address1: '東京都',
    address2: '確認用住所',
    tel: '090-1234-5678',
    agreeToPrivacyPolicy: true,
  };
  assert.deepEqual((await shop.parse({ form, formEmail })).errors, []);
  const { errors } = await shop.parse({
    form: { ...form, zipcode: 'x', tel: 'x' },
    formEmail,
  });
  assert.deepEqual(
    errors.map((e) => e.path),
    ['form.zipcode', 'form.tel'],
  );
});
