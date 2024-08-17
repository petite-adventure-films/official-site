<script setup lang="ts">
definePageMeta({
  title: 'プライバシーポリシー',
  layout: false,
});
</script>

<template>
  <NuxtLayout name="post">
    <template #breadcrumb>
      <BreadCrumb />
    </template>
    <template #h2>プライバシーポリシー</template>
    <PrivacyPolicy />
    <p class="mt-16">
      個人情報の取り扱いに関する問合せ先<br />
      個人情報に関するご確認、ご要望およびお問合せなどにつきましては、
      以下の連絡先までお願いいたします。
    </p>
    <ButtonLink to="/contact/" class="mt-4">お問い合わせ</ButtonLink>
  </NuxtLayout>
</template>
