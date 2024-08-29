<script setup lang="ts">
import { Stage } from '~/types/pafshop-stage';
import type { Customer } from '~/types/pafshop-customer';

definePageMeta({
  layout: false,
});

const config = useRuntimeConfig();
const route = useRoute();
const router = useRouter();

route.meta.title = 'SHOP';
useSeoMeta({
  ogUrl: `${config.public.SITE_URL}pafshop/`,
});

const { basket, subTotalInBasket, shippingFee, emptyBasket } = useBasketState();
const stage = useCheckoutStage();
const customerInfo = useCustomerInfo();
const paymentMethod = usePaymentMethod();

const params = {
  basket: basket.value,
  subTotal: subTotalInBasket.value,
  shippingFee: shippingFee.value,
  paymentMethod: paymentMethod.value,
  customerInfo: customerInfo.value,
};
const apiUrl = `${config.public.API_BASE}wp/wp-json/wp/v2/checkout/`;
const { error } = await useFetch(apiUrl, {
  method: 'POST',
  body: JSON.stringify(params),
});
if (error.value) {
  router.push('/pafshop/error/');
  stage.value = Stage.CONFIRM;
} else {
  emptyBasket();
  stage.value = Stage.CONFIRM;
  paymentMethod.value = undefined;
  customerInfo.value = {} as Customer;
}
</script>

<template>
  <NuxtLayout name="checkout">
    <template #breadcrumb>
      <ShopBreadCrumb />
    </template>
    <template #h2> 注文完了 </template>
    <p>ご注文、誠にありがとうございます。</p>
    <p>
      <span v-if="paymentMethod === 'bank_transfer'"
        >ご注文内容の確認と、代金のお支払いについてご連絡を差し上げます。</span
      >
      <span v-else>ご注文内容の確認についてご連絡を差し上げます。</span>
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
