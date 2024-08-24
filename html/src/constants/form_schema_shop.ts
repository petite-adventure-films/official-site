import * as zod from 'zod';
import { toTypedSchema } from '@vee-validate/zod';

export const validationSchema = toTypedSchema(
  zod.object({
    form: zod.object({
      name: zod
        .string()
        .min(1, '必須項目です')
        .max(50, '50文字以内で入力してください'),
      zipcode: zod
        .string()
        .regex(
          new RegExp('^[-ー0-9０-９]{7,8}$'),
          '郵便番号の形式が正しくありません',
        ),
      address1: zod.string().min(1, '必須項目です'),
      address2: zod.string().min(1, '必須項目です'),
      tel: zod
        .string()
        .regex(
          new RegExp('^[-ー0-9０-９]{10,13}$'),
          '電話番号の形式が正しくありません',
        ),
      receipt: zod.boolean().optional(),
      receiptName: zod.string().optional(),
      receiptDescription: zod.string().optional(),
      agreeToPrivacyPolicy: zod.boolean({
        message: 'プライバシーポリシーに同意してください',
      }),
    }),
    formEmail: zod
      .object({
        email: zod
          .string()
          .min(1, '必須項目です')
          .email('メールアドレスの形式が正しくありません'),
        emailConfirm: zod
          .string()
          .min(1, '必須項目です')
          .email('メールアドレスの形式が正しくありません'),
      })
      .refine(({ email, emailConfirm }) => email === emailConfirm, {
        path: ['emailConfirm'],
        message: 'メールアドレスが一致していません',
      }),
  }),
);
