<script setup lang="ts">
const config = useRuntimeConfig();

const props = withDefaults(
  defineProps<{
    currentYear?: number;
  }>(),
  {
    currentYear: 0,
  },
);

const startYear = config.public.SINCE;
const yearArgs = Array.from(
  { length: config.public.THIS_YEAR - startYear },
  (_, i) => startYear + i,
).sort((a, b) => b - a);
</script>

<template>
  <H3>お知らせアーカイブ</H3>
  <ul class="mt-4 flex flex-wrap gap-2">
    <li
      v-for="year in yearArgs"
      :key="`archive-news-${year}`"
      :class="['group', props.currentYear === year ? 'is-active' : '']"
    >
      <NuxtLink
        :to="`/news/archive/${year}/`"
        class="block border border-black px-2 py-1 group-[.is-active]:bg-gray-100 sm:hover:bg-gray-100"
        >{{ year }}</NuxtLink
      >
    </li>
  </ul>
</template>
