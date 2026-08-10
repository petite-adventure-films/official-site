import { useMemo, useState } from 'react';

type FormValues = {
  name: string;
  email: string;
  emailConfirm: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;
type TouchedFields = Partial<Record<keyof FormValues, boolean>>;

const initialValues: FormValues = { name: '', email: '', emailConfirm: '', message: '' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactForm(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (values.name.length === 0) errors.name = '必須項目です';
  else if (values.name.length > 50) errors.name = '50文字以内で入力してください';

  if (values.email.length === 0) errors.email = '必須項目です';
  else if (!EMAIL_PATTERN.test(values.email)) {
    errors.email = 'メールアドレスの形式が正しくありません';
  }

  if (values.emailConfirm.length === 0) errors.emailConfirm = '必須項目です';
  else if (!EMAIL_PATTERN.test(values.emailConfirm)) {
    errors.emailConfirm = 'メールアドレスの形式が正しくありません';
  } else if (values.email !== values.emailConfirm) {
    errors.emailConfirm = 'メールアドレスが一致していません';
  }

  if (values.message.length === 0) errors.message = '必須項目です';
  else if (values.message.length > 400) errors.message = '400文字以内で入力してください';

  return errors;
}

export default function ContactForm() {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState<TouchedFields>({});
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const errors = useMemo(() => validateContactForm(values), [values]);
  const valid = Object.keys(errors).length === 0;

  const update = (key: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };
  const markTouched = (key: keyof FormValues) => {
    setTouched((current) => ({ ...current, [key]: true }));
  };

  const submit = async () => {
    if (!valid) return;
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          message: values.message,
        }),
      });
      window.location.href = response.ok ? '/contact/thanks/' : '/contact/error/';
    } catch {
      window.location.href = '/contact/error/';
    }
  };

  const labelClass = "flex gap-1 text-xs text-gray-900 before:text-red-600 before:content-['*']";
  const inputClass =
    'mt-2 block h-10 w-4/5 border border-black p-2 disabled:border-gray-100 disabled:bg-gray-50 disabled:text-black disabled:opacity-100';
  const submitButtonStateClass =
    valid && !submitting
      ? 'border border-black bg-blue-600 text-white sm:hover:border-blue-600 sm:hover:bg-gray-100 sm:hover:text-blue-600'
      : 'cursor-not-allowed bg-gray-100 text-gray-500';
  const errorMessage = (key: keyof FormValues) =>
    touched[key] && errors[key] ? (
      <p role="alert" className="mt-1 text-xs text-red-600">
        {errors[key]}
      </p>
    ) : null;

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <label className={labelClass} htmlFor="contact-name">
        名前
      </label>
      <input
        id="contact-name"
        name="name"
        type="text"
        className={inputClass}
        value={values.name}
        onChange={(event) => {
          update('name', event.target.value);
        }}
        onBlur={() => {
          markTouched('name');
        }}
        disabled={confirming}
        required
      />
      {errorMessage('name')}

      <div className="mt-4">
        <label className={labelClass} htmlFor="contact-email">
          メールアドレス
        </label>
      </div>
      <input
        id="contact-email"
        name="email"
        type="email"
        className={inputClass}
        value={values.email}
        onChange={(event) => {
          update('email', event.target.value);
        }}
        onBlur={() => {
          markTouched('email');
        }}
        disabled={confirming}
        required
      />
      {errorMessage('email')}

      <div className="mt-4">
        <label className={labelClass} htmlFor="contact-email-confirm">
          メールアドレス確認
        </label>
      </div>
      <input
        id="contact-email-confirm"
        name="emailConfirm"
        type="email"
        className={inputClass}
        value={values.emailConfirm}
        onChange={(event) => {
          update('emailConfirm', event.target.value);
        }}
        onBlur={() => {
          markTouched('emailConfirm');
        }}
        disabled={confirming}
        required
      />
      {errorMessage('emailConfirm')}

      <div className="mt-4">
        <label className={labelClass} htmlFor="contact-message">
          お問い合わせ内容
        </label>
      </div>
      <textarea
        id="contact-message"
        name="message"
        className="mt-2 block h-32 w-full rounded-none border border-black p-2 disabled:border-gray-100 disabled:bg-gray-50 disabled:opacity-100"
        value={values.message}
        onChange={(event) => {
          update('message', event.target.value);
        }}
        onBlur={() => {
          markTouched('message');
        }}
        disabled={confirming}
        required
      />
      {errorMessage('message')}

      <div className="mt-8">
        <button
          type="submit"
          disabled={!valid || submitting}
          className={`inline-flex min-w-48 items-center gap-2 px-6 py-4 text-base font-medium ${submitButtonStateClass}`}
        >
          {submitting ? '送信中…' : confirming ? '送信する' : '内容を確認する'}
        </button>
        {confirming && !submitting && (
          <button
            type="button"
            className="link-text mt-2 block"
            onClick={() => {
              setConfirming(false);
            }}
          >
            内容を編集する
          </button>
        )}
      </div>
    </form>
  );
}
