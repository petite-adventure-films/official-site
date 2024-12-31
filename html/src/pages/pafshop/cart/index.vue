<script setup lang="ts">
import META from '~/constants/meta.json';

definePageMeta({
  layout: false,
});

const config = useRuntimeConfig();
const route = useRoute();
const router = useRouter();

route.meta.title = 'SHOP';
useSeoMeta({
  description: META.pafshop,
  ogDescription: META.pafshop,
  ogUrl: `${config.public.SITE_URL}pafshop/`,
});

const {
  basket,
  itemsToCheckout,
  updateBasket,
  subTotalInBasket,
  shippingFee,
  emptyBasket,
} = useBasketState();
const loading = ref(true);
const isPurchasing = ref(false);

// stripe決済へ
const purchase = async () => {
  try {
    if (isPurchasing.value) {
      return;
    }
    isPurchasing.value = true;
    const response = await $fetch(
      `${config.public.API_BASE}stripe/checkout.php`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsToCheckout.value,
          shipping_fee: shippingFee.value,
        }),
      },
    );
    if (response.url) {
      emptyBasket();
      window.location.href = response.url;
    }
  } catch (error) {
    router.push('/pafshop/error/');
  }
};

onMounted(() => {
  loading.value = false;

  const basketData = sessionStorage.getItem('basket');
  if (basketData) {
    updateBasket(JSON.parse(basketData));
  }
});
</script>

<template>
  <NuxtLayout name="checkout">
    <template #h2>注文内容の確認</template>
    <div v-if="!loading && basket && basket.length > 0">
      <ShopBasketItem :basket="basket" :editable="true" />
      <dl>
        <div class="flex justify-between py-1 px-2 border-b text-right">
          <dt>商品合計</dt>
          <dd>￥{{ subTotalInBasket.toLocaleString() }}</dd>
        </div>
        <div class="flex justify-between py-1 px-2 border-b text-right">
          <dt>送料</dt>
          <dd>￥{{ shippingFee.toLocaleString() }}</dd>
        </div>
        <div
          class="flex justify-between py-1 px-2 bg-gray-100 border-b font-bold text-right"
        >
          <dt>合計</dt>
          <dd>￥{{ (subTotalInBasket + shippingFee).toLocaleString() }}</dd>
        </div>
      </dl>
      <p class="mt-2 text-sm text-gray-500">
        ※価格には消費税が含まれています<br />
        ※1回のご注文ごとに送料300円が掛かります<br />
        <span class="text-purple-600">3,000円以上のお買い上げで送料無料！</span>
      </p>

      <Button
        type="shop"
        class="mt-4"
        :disabled="isPurchasing"
        @click="purchase"
        >注文する</Button
      ><br />
      <p class="mt-2 text-sm text-gray-500">
        ※注文後、Stripe決済画面に移動します。
      </p>
      <NuxtLink
        :to="isPurchasing ? '' : '/pafshop/'"
        :aria-disabled="isPurchasing"
        :role="isPurchasing ? 'button' : null"
        class="block link-text mt-4"
        >買い物を続ける</NuxtLink
      >
    </div>
    <div v-else-if="!loading && basket.length === 0">
      <p>カートに商品がありません</p>
    </div>
  </NuxtLayout>
</template>
