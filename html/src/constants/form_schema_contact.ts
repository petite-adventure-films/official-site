import * as zod from 'zod';
import { toTypedSchema } from '@vee-validate/zod';

export const validationSchema = toTypedSchema(
  zod.object({
    form: zod.object({
      name: zod
        .string()
        .min(1, '必須項目です')
        .max(50, '50文字以内で入力してください'),
      message: zod
        .string()
        .min(1, '必須項目です')
        .max(400, '400文字以内で入力してください'),
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
