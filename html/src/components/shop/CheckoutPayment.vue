<script setup lang="ts">
import { Stage } from '~/types/pafshop-stage';
const stage = useCheckoutStage();
const paymentMethod = usePaymentMethod();
</script>

<template>
  <ShopCheckoutStep :current-stage="Stage.PAYMENT">
    <div v-if="stage === Stage.PAYMENT">
      <label for="bank_transfer" class="block mt-4">
        <div
          class="inline-flex items-center gap-x-1 border border-black h-10 p-2"
        >
          <input
            id="bank_transfer"
            v-model="paymentMethod"
            type="radio"
            value="bank_transfer"
          />
          銀行振込
        </div>
        <img
          src="~/assets/images/pafshop/bank_logo_yucho.png"
          alt="ゆうちょ銀行"
          class="h-5 mt-2"
        />
        <div class="flex gap-x-1 item-center mt-2">
          <img
            src="~/assets/images/pafshop/bank_logo_mufg.png"
            alt=""
            class="h-5"
          /><span class="text-xs">三菱UFJ銀行</span>
        </div>
        <img
          src="~/assets/images/pafshop/bank_logo_paypay.png"
          alt="PayPay銀行"
          class="h-5 mt-2"
        />
      </label>
      <p class="mt-2">
        振込先情報は注文確定後の確認メールに記載されております。<br />振込手数料はご負担下さい。
      </p>
      <label for="creadit_card" class="block mt-4">
        <div
          class="inline-flex items-center gap-x-1 border border-black h-10 p-2"
        >
          <input
            id="creadit_card"
            v-model="paymentMethod"
            type="radio"
            value="credit_card"
          />
          クレジットカード
        </div>
        <div class="flex gap-x-2 items-center mt-2">
          <img
            src="~/assets/images/pafshop/card_logo_visa.gif"
            alt="PayPay銀行"
            class="h-5"
          />
          <img
            src="~/assets/images/pafshop/card_logo_mastercard.gif"
            alt="PayPay銀行"
            class="h-5"
          />
        </div>
      </label>
      <p class="mt-2">注文確定後、お支払い画面へ移動します。</p>
      <Button
        :disabled="paymentMethod === undefined"
        class="mt-4"
        @click="stage = Stage.COMPLETE"
      >
        次へ進む
      </Button>
    </div>
    <div v-else-if="stage >= Stage.COMPLETE">
      {{ paymentMethod === 'bank_transfer' ? '銀行振込' : 'クレジットカード' }}
    </div>
  </ShopCheckoutStep>
</template>
