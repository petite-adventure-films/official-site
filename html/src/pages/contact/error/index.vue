<script setup lang="ts">
definePageMeta({
  layout: false,
});

const route = useRoute();
route.meta.title = 'お問い合わせ';
</script>

<template>
  <NuxtLayout name="post">
    <template #breadcrumb>
      <BreadCrumb />
    </template>
    <template #h2> お問い合わせ </template>
    <p>
      エラーが発生しました。<br />お手数ですが、もう一度始めからやり直してください。
    </p>
    <p class="mt-2">
      <NuxtLink to="/contact/" class="link-text mt-8">入力画面に戻る</NuxtLink
      ><br />
      <NuxtLink to="/?op=skip" class="link-text mt-8">HOMEへ戻る</NuxtLink>
    </p>
  </NuxtLayout>
</template>
