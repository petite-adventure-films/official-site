<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    isRecommendedList?: boolean;
  }>(),
  {
    isRecommendedList: false,
  },
);
</script>

<template>
  <ul class="flex">
    <li class="border-t border-l border-black">
      <NuxtLink
        v-if="props.isRecommendedList"
        class="block p-2 bg-gray-100 sm:hover:bg-white"
        to="/blog/"
        >全記事</NuxtLink
      >
      <span v-else class="block p-2">全記事</span>
    </li>
    <li class="border-t border-l border-r border-black">
      <span v-if="props.isRecommendedList" class="block p-2"
        ><EmojiRecommended /> おすすめ記事</span
      >
      <NuxtLink
        v-else
        class="block p-2 bg-gray-100 sm:hover:bg-white"
        to="/blog/recommended/"
        ><EmojiRecommended /> おすすめ記事</NuxtLink
      >
    </li>
  </ul>
</template>
