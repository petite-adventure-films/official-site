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
    <p>
      エラーが発生しました。<br />お手数ですが、もう一度始めからやり直してください。
    </p>
    <p class="mt-2">
      <NuxtLink to="/pafshop/cart/" class="link-text mt-8"
        >注文手続きに戻る</NuxtLink
      ><br />
      <NuxtLink to="/?op=skip" class="link-text mt-8"
        >公式サイトへ戻る</NuxtLink
      >
    </p>
  </NuxtLayout>
</template>
