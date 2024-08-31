<script setup lang="ts">
import { Stage } from '~/types/pafshop-stage';

definePageMeta({
  layout: false,
});

const config = useRuntimeConfig();
const route = useRoute();

route.meta.title = 'SHOP';
useSeoMeta({
  ogUrl: `${config.public.SITE_URL}pafshop/`,
});

const router = useRouter();
const { basket, updateBasket } = useBasketState();
const stage = useCheckoutStage();
const paymentMethod = usePaymentMethod();

const loading = ref(true);

const isCompleted = ref(false);

const completeOrder = () => {
  isCompleted.value = true;
  if (paymentMethod.value === 'bank_transfer') {
    router.push('/pafshop/thanks/');
  } else {
    router.push('/pafshop/payment/');
  }
};

onMounted(() => {
  loading.value = false;
  if (sessionStorage.getItem('basket')) {
    updateBasket(JSON.parse(sessionStorage.getItem('basket')));
  }
});
</script>

<template>
  <NuxtLayout name="checkout">
    <template #breadcrumb>
      <ShopBreadCrumb />
    </template>
    <div
      v-if="!loading && stage < Stage.FINISH && basket && basket.length > 0"
      class="pl-2 border-l border-black"
    >
      <ShopCheckoutOrder />
      <ShopCheckoutCustomerInfo class="mt-8" />
      <ShopCheckoutPayment class="mt-8" />
      <div v-if="stage === Stage.COMPLETE" class="mt-8">
        <p>上記の内容で問題なければ、注文を確定してください。</p>
        <Button class="mt-2" :disabled="isCompleted" @click="completeOrder()"
          >注文を確定する</Button
        >
      </div>
    </div>
    <div
      v-else-if="
        !loading && stage < Stage.FINISH && basket && basket.length === 0
      "
    >
      <p class="text-center mt-8">カートに商品が入っていません。</p>
      <a href="/pafshop/" class="block link-text text-center mt-8"
        >商品一覧へ戻る</a
      >
    </div>
  </NuxtLayout>
</template>
