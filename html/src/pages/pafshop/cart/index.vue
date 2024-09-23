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

const { basket, updateBasket, subTotalInBasket } = useBasketState();
const loading = ref(true);

onMounted(() => {
  loading.value = false;

  if (sessionStorage.getItem('basket')) {
    updateBasket(JSON.parse(sessionStorage.getItem('basket')));
  }
});
</script>

<template>
  <NuxtLayout name="checkout">
    <template #h2>注文内容の確認</template>
    <div v-if="!loading && basket && basket.length > 0">
      <p class="sticky top-0 py-1 px-2 bg-gray-100 text-xl text-right">
        合計金額:
        <span>￥{{ subTotalInBasket.toLocaleString() }}</span>
      </p>
      <ShopBasketItem :basket="basket" :editable="true" />
      <p class="mt-2 text-sm text-gray-500">
        ※価格には消費税が含まれています<br />
        ※1回のご注文ごとに送料300円が掛かります<br />
        <span class="text-purple-600">3,000円以上のお買い上げで送料無料！</span>
      </p>
      <ButtonLink type="shop" to="/pafshop/checkout/" class="mt-4"
        >注文を確定する</ButtonLink
      ><br />
      <NuxtLink to="/pafshop/" class="block link-text mt-4"
        >買い物を続ける</NuxtLink
      >
    </div>
    <div v-else-if="!loading && basket.length === 0">
      <p>カートに商品がありません</p>
    </div>
  </NuxtLayout>
</template>
