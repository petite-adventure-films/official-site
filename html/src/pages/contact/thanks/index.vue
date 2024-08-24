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
    <template #h2> お問い合わせ送信完了 </template>
    <p>お問い合わせいただきありがとうございました。</p>
    <p>
      お問い合わせを受け付けいたしました。<br />
      お問い合わせ内容を確認の上、順次ご返信させていただきますので、今しばらくお待ちくださいませ。
    </p>
    <p class="mt-2">
      <NuxtLink to="/?op=skip" class="link-text mt-8">HOMEへ戻る</NuxtLink>
    </p>
  </NuxtLayout>
</template>
