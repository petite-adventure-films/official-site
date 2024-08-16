<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    currentYear?: number;
  }>(),
  {
    currentYear: 0,
  },
);

const thisYear = 2024;
const startYear = 2011;
const yearArgs = Array.from(
  { length: thisYear - 1 - startYear + 1 },
  (_, i) => startYear + i,
).sort((a, b) => b - a);
</script>

<template>
  <H3>イベント・上映会アーカイブ</H3>
  <ul class="mt-4 flex flex-wrap gap-2">
    <li
      v-for="year in yearArgs"
      :key="`archive-event-${year}`"
      :class="['group', props.currentYear === year ? 'is-active' : '']"
    >
      <NuxtLink
        :to="`/events/archive/${year}/`"
        class="block border border-black px-2 py-1 group-[.is-active]:bg-black group-[.is-active]:text-white sm:hover:bg-gray-100"
        >{{ year }}</NuxtLink
      >
    </li>
  </ul>
</template>
