<script setup lang="ts">
import { Stage } from '~/types/pafshop-stage';
import { useForm, useField } from 'vee-validate';
import { validationSchema } from '~/constants/form_schema_shop';

const stage = useCheckoutStage();
const customerInfo = useCustomerInfo();

const { handleSubmit, errors, meta } = useForm({
  validationSchema,
});

const { value: name } = useField<string>('form.name');
const { value: zipcode } = useField<string>('form.zipcode');
const { value: address1 } = useField<string>('form.address1');
const { value: address2 } = useField<string>('form.address2');
const { value: tel } = useField<string>('form.tel');
const { value: email } = useField<string>('formEmail.email');
const { value: emailConfirm } = useField<string>('formEmail.emailConfirm');
const { value: receipt } = useField<boolean | undefined>('form.receipt');
const { value: receiptName } = useField<string | undefined>('form.receiptName');
const { value: receiptDescription } = useField<string | undefined>(
  'form.receiptDescription',
);
const { value: agreeToPrivacyPolicy } = useField<boolean>(
  'form.agreeToPrivacyPolicy',
);

if (process.env.NODE_ENV === 'development') {
  name.value = 'ダミーユーザー';
  zipcode.value = '1638001';
  address1.value = '東京都新宿区西新宿';
  address2.value = '2-8-1';
  tel.value = '0353211111';
  email.value = 'title-glasses0h@icloud.com';
  emailConfirm.value = 'title-glasses0h@icloud.com';
  agreeToPrivacyPolicy.value = true;
}

const replaceToHalfWidth = (str: string) =>
  str
    .replace(/[‐－―ー]/g, '')
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
      String.fromCharCode(s.charCodeAt(0) - 0xfee0),
    );

const getAddress = async () => {
  const { data } = await $fetch<{
    data: { fullAddress: string };
  }>(
    `https://api.zipaddress.net/?zipcode=${replaceToHalfWidth(zipcode.value)}`,
  );
  address1.value = data ? data.fullAddress : '';
};

const costomerInfoList = computed(() => {
  const list = [
    { index: '名前', text: customerInfo.value.name },
    {
      index: '住所',
      text: `〒${customerInfo.value.zipcode}\n${customerInfo.value.address1}${customerInfo.value.address2}`,
    },
    { index: '電話番号', text: customerInfo.value.tel },
    { index: 'メールアドレス', text: customerInfo.value.email },
    { index: '領収書', text: customerInfo.value.receipt ? '必要' : '不要' },
  ];
  if (customerInfo.value.receipt) {
    list.push(
      {
        index: '宛名',
        text: customerInfo.value.receiptName
          ? customerInfo.value.receiptName
          : '（入力なし）',
      },
      {
        index: '但し書き',
        text: customerInfo.value.receiptDescription
          ? customerInfo.value.receiptDescription
          : '（入力なし）',
      },
    );
  }
  list.push({ index: '個人情報の取り扱いについて', text: '同意' });
  return list;
});

const onSubmit = handleSubmit((values) => {
  customerInfo.value = {
    name: values.form.name,
    zipcode: values.form.zipcode,
    address1: values.form.address1,
    address2: values.form.address2,
    tel: values.form.tel,
    email: values.formEmail.email,
    receipt: values.form.receipt,
    receiptName: values.form.receiptName,
    receiptDescription: values.form.receiptDescription,
    agreeToPrivacyPolicy: values.form.agreeToPrivacyPolicy,
  };

  stage.value = Stage.PAYMENT;
});
</script>

<template>
  <ShopCheckoutStep :current-stage="Stage.USER_INFO">
    <div v-if="stage === Stage.USER_INFO">
      <span role="alert" class="block mt-2 text-xs text-red-600">* 必須</span>
      <form novalidate class="[&>div]:mt-2" @submit.prevent="onSubmit">
        <FormInputText
          v-model="name"
          name="name"
          :required="true"
          label="名前"
          :error-message="errors['form.name']"
        />
        <FormInputText
          v-model="zipcode"
          name="zipcode"
          :required="true"
          label="郵便番号"
          placeholder="半角/全角数字・ハイフンのみ"
          :error-message="errors['form.zipcode']"
          @change="getAddress()"
        />
        <FormInputText
          v-model="address1"
          name="address1"
          :required="true"
          label="都道府県・市区町村"
          :error-message="errors['form.address1']"
        />
        <FormInputText
          v-model="address2"
          name="address2"
          :required="true"
          label="番地以降の住所"
          :error-message="errors['form.address2']"
        />
        <FormInputText
          v-model="tel"
          name="tel"
          type="tel"
          :required="true"
          label="電話番号"
          placeholder="半角/全角数字"
          :error-message="errors['form.tel']"
        />
        <FormInputText
          v-model="email"
          name="email"
          type="email"
          :required="true"
          label="メールアドレス"
          :error-message="errors['formEmail.email']"
        />
        <FormInputText
          v-model="emailConfirm"
          name="emailConfirm"
          type="email"
          :required="true"
          label="メールアドレス確認"
          :error-message="errors['formEmail.emailConfirm']"
        />
        <FormInputCheckbox
          v-model="receipt"
          name="receipt"
          label="領収書"
          input-label="必要"
        />
        <FormInputText
          v-if="receipt"
          v-model="receiptName"
          name="receiptName"
          type="text"
          label="宛名"
        />
        <FormInputText
          v-if="receipt"
          v-model="receiptDescription"
          name="receiptDescription"
          type="text"
          label="但し書き"
        />
        <FormInputCheckbox
          v-model="agreeToPrivacyPolicy"
          :required="true"
          name="privacyPolicy"
          label="個人情報の取り扱いについて"
          input-label="上記個人情報の取扱について同意しました"
        >
          <div class="w-full h-56 overflow-y-auto border mt-2 p-4 text-xs">
            <PrivacyPolicy />
          </div>
        </FormInputCheckbox>
        <div class="mt-4">
          <p v-if="meta.valid">
            お客様情報の入力ができましたら、お支払い方法選択に進んでください。
          </p>
          <Button :disabled="!meta.valid" class="mt-2"> 次へ進む </Button>
        </div>
      </form>
    </div>
    <DefinitionList
      v-else-if="stage >= Stage.PAYMENT"
      :list="costomerInfoList"
    />
  </ShopCheckoutStep>
</template>
