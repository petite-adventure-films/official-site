<script setup lang="ts">
import { loadStripe } from '@stripe/stripe-js';
import { useRecaptchaProvider } from 'vue-recaptcha';

definePageMeta({
  layout: false,
});

const config = useRuntimeConfig();
const route = useRoute();

route.meta.title = 'SHOP';
useSeoMeta({
  ogUrl: `${config.public.SITE_URL}pafshop/`,
});

useRecaptchaProvider();
const isRecapchaVerified = ref();

const { subTotalInBasket, shippingFee } = useBasketState();

const stripe = await loadStripe(config.public.STRIPE_PUBLISHABLE_KEY);
const paymentElement = ref();
const elements = ref();
const isCompleted = ref(false);

// 決済画面描画
try {
  const response = await $fetch(`${config.public.API_BASE}stripe/create.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: subTotalInBasket.value + shippingFee.value,
    }),
  });
  const appearance = {
    theme: 'flat',
  };
  elements.value = stripe.elements({
    appearance,
    clientSecret: response.clientSecret,
  });
  paymentElement.value = elements.value.create('payment');
} catch (error) {
  router.push('/pafshop/error/');
}

// 決済処理
watch(isRecapchaVerified, (newValue) => {
  if (newValue) {
    paymentElement.value.mount('#payment-element');

    const handleSubmit = async (e) => {
      e.preventDefault();
      isCompleted.value = true;
      const { error } = await stripe.confirmPayment({
        elements: elements.value,
        redirect: 'if_required',
      });
      if (error) {
        router.push('/pafshop/error/');
      } else {
        router.push('/pafshop/thanks/');
      }
    };

    document
      .querySelector('#payment-form')!
      .addEventListener('submit', handleSubmit);
  } else {
    paymentElement.value.unmount();
  }
});

// 決済処理
</script>

<template>
  <NuxtLayout>
    <div class="wrapper">
      <RecaptchaCheckbox
        v-if="!isRecapchaVerified"
        key="light"
        v-model="isRecapchaVerified"
        theme="light"
      />
      <form id="payment-form">
        <div id="payment-element" class="mt-8" />
        <Button v-if="isRecapchaVerified" :disabled="isCompleted" class="mt-8">
          購入する
        </Button>
        <div id="payment-message" class="hidden" />
      </form>
    </div>
  </NuxtLayout>
</template>
