<script setup lang="ts">
import { validationSchema } from '~/constants/form_schema_contact';
import { useForm, useField } from 'vee-validate';

definePageMeta({
  layout: false,
});

const route = useRoute();
route.meta.title = 'お問い合わせ';

enum Stage {
  INPUT = 1,
  CONFIRM = 2,
  COMPLETE = 3,
  ERROR = 4,
}
const router = useRouter();
const stage = ref<Stage>(Stage.INPUT);

const { handleSubmit, errors, meta } = useForm({
  validationSchema,
});

const { value: name } = useField<string>('form.name');
const { value: email } = useField<string>('formEmail.email');
const { value: emailConfirm } = useField<string>('formEmail.emailConfirm');
const { value: message } = useField<string>('form.message');

const onSubmit = handleSubmit(async () => {
  stage.value = Stage.COMPLETE;
  const config = useRuntimeConfig();
  const apiUrl = `${config.public.API_BASE}wp/wp-json/wp/v2/contact/`;
  useFetch(apiUrl, {
    method: 'POST',
    body: JSON.stringify({
      name: name.value,
      email: email.value,
      message: message.value,
    }),
  }).then(({ error }) => {
    if (error) {
      router.push('/contact/error/');
      return false;
    }
    router.push('/contact/thanks/');
  });
});
</script>

<template>
  <NuxtLayout name="post">
    <template #breadcrumb>
      <BreadCrumb />
    </template>
    <template #h2>お問い合わせ</template>
    <form novalidate @submit="onSubmit">
      <FormInputText
        v-model="name"
        name="name"
        :required="true"
        label="名前"
        :error-message="errors['form.name']"
        :disabled="stage >= Stage.CONFIRM"
      />
      <FormInputText
        v-model="email"
        name="email"
        type="email"
        :required="true"
        label="メールアドレス"
        :error-message="errors['formEmail.email']"
        class="mt-4"
        :disabled="stage >= Stage.CONFIRM"
      />
      <FormInputText
        v-model="emailConfirm"
        name="emailConfirm"
        type="email"
        :required="true"
        label="メールアドレス確認"
        :error-message="errors['formEmail.emailConfirm']"
        class="mt-4"
        :disabled="stage >= Stage.CONFIRM"
      />
      <FormTextarea
        v-model="message"
        name="message"
        :required="true"
        label="お問い合わせ内容"
        :error-message="errors['form.message']"
        class="mt-4"
        :disabled="stage >= Stage.CONFIRM"
      />

      <div class="mt-8">
        <Button
          v-if="stage === Stage.INPUT"
          :disabled="!meta.valid"
          @click="stage = Stage.CONFIRM"
        >
          内容を確認する
        </Button>
        <Button v-if="stage > Stage.INPUT" :disabled="stage >= Stage.COMPLETE"
          >送信する</Button
        ><br />
        <button
          v-if="stage > Stage.INPUT"
          class="[&:not(:disabled)]:link-text mt-2"
          :disabled="stage >= Stage.COMPLETE"
          @click="stage = Stage.INPUT"
        >
          内容を編集する
        </button>
      </div>
    </form>
  </NuxtLayout>
</template>
