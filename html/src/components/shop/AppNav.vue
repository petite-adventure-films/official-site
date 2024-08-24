<script setup lang="ts">
const { counterInBasket } = useBasketState();
</script>

<template>
  <div class="sticky -top-[1px] mt-8 z-50 flex gap-2 justify-center">
    <NuxtLink
      to="/pafshop/faq/"
      class="relative flex flex-col w-12 h-12 justify-center items-center bg-gray-50 sm:hover:bg-white sm:hover:text-black"
    >
      <span class="text-xs leading-none">FAQ</span>
    </NuxtLink>
    <NuxtLink
      to="/pafshop/cart/"
      class="relative flex flex-col w-12 h-12 justify-center items-center border border-purple-600 bg-gray-50 sm:hover:bg-white"
    >
      🛒<span
        class="text-xs leading-none"
        :class="
          counterInBasket > 0 ? 'font-bold text-purple-600 text-base' : ''
        "
        >{{ counterInBasket }}</span
      >
    </NuxtLink>
  </div>
</template>
