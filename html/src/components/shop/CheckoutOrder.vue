<script setup lang="ts">
import { Stage } from '~/types/pafshop-stage';
const stage = useCheckoutStage();
const { subTotalInBasket, shippingFee } = useBasketState();
</script>

<template>
  <ShopCheckoutStep :current-stage="Stage.CONFIRM">
    <ShopBasketItem :editable="false" />
    <p class="mt-4 py-1 px-2 text-right">
      商品の小計:
      <span class="palt">￥{{ subTotalInBasket.toLocaleString() }}</span
      ><br />
      配送料: <span class="palt">￥{{ shippingFee.toLocaleString() }}</span>
    </p>
    <p class="mt-2 py-1 px-2 bg-gray-100 text-xl sm:text-xl text-right">
      合計金額:
      <span class="palt"
        >￥{{ (subTotalInBasket + shippingFee).toLocaleString() }}</span
      >
    </p>
    <div v-if="stage === Stage.CONFIRM">
      <p class="mt-4">
        注文内容に問題なければ、お客様情報入力に進んでください。
      </p>
      <Button
        v-if="stage === Stage.CONFIRM"
        :disabled="false"
        class="mt-2"
        @click="stage = Stage.USER_INFO"
        >次へ進む</Button
      >
    </div>
  </ShopCheckoutStep>
</template>
