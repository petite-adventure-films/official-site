<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    editable: boolean;
  }>(),
  {
    editable: false,
  },
);

const { basket, updateBasket, deleteFromBasket } = useBasketState();
const _basket = ref(JSON.parse(JSON.stringify(basket.value))); // 別物としてコピー

watch(basket.value, (newValue) => {
  _basket.value = JSON.parse(JSON.stringify(newValue)); // 変更があったらまた別物としてコピー
});
</script>

<template>
  <ul class="[&_li:not(:first-of-type)]:pt-4">
    <li v-for="(item, key) in _basket" :key="key" class="py-4 px-2 border-b">
      <div>{{ item.title }}</div>
      <div class="flex flex-wrap justify-between items-center">
        <div>{{ item.type }}{{ item.disc }}</div>
        <div class="flex-1 flex gap-x-1 justify-end items-center">
          <div class="palt">￥{{ item.amount.toLocaleString() }}</div>
          <select
            v-if="props.editable"
            v-model="item.unit"
            class="border border-black px-2 py-1"
            @change="updateBasket(_basket)"
          >
            <option
              v-for="unit in [...Array(10).keys()]"
              :key="unit"
              :value="unit + 1"
              :selected="unit + 1 === item.unit"
            >
              {{ unit + 1 }}
            </option>
          </select>
          <div v-else><span class="text-xs">x </span>{{ item.unit }}</div>
        </div>
      </div>
      <button
        v-if="props.editable"
        class="mt-1 text-gray-500 text-xs"
        @click="deleteFromBasket(item)"
      >
        削除
      </button>
    </li>
  </ul>
</template>
