<script setup lang="ts">
import META from '~/constants/meta.json';

definePageMeta({
  layout: false,
});

const config = useRuntimeConfig();
const route = useRoute();

route.meta.title = 'SHOP';
useSeoMeta({
  description: META.pafshop,
  ogDescription: META.pafshop,
  ogUrl: `${config.public.SITE_URL}pafshop/`,
});
</script>

<template>
  <NuxtLayout name="checkout">
    <template #breadcrumb>
      <ShopBreadCrumb />
    </template>
    <template #h2> 注文完了 </template>
    <p>ご注文、誠にありがとうございます。</p>
    <p>
      ご注文内容の確認についてご連絡を差し上げます。
      <br />しばらくお待ちください。
    </p>
    <p class="mt-2">
      <NuxtLink to="/pafshop/" class="link-text mt-8">SHOPへ戻る</NuxtLink
      ><br />
      <NuxtLink to="/?op=skip" class="link-text mt-8"
        >公式サイトへ戻る</NuxtLink
      >
    </p>
  </NuxtLayout>
</template>
