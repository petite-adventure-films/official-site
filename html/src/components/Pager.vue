<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    page: string;
    totalPages: number;
    currentPage: string;
  }>(),
  {
    page: '',
    totalPages: 0,
    currentPage: '1',
  },
);

const currentPage = Number(props.currentPage);
const pageNumbers = [...Array(props.totalPages).keys()].map((i) => ++i);
const _pages = [];

for (const i of pageNumbers) {
  i === 1 && _pages.push(i);
  i === pageNumbers.length && _pages.push(i);
  if (i % 10 === 0) {
    _pages.push(i);
  }
  i === currentPage && _pages.push(i);
  i === currentPage - 1 && _pages.push(i);
  i === currentPage + 1 && _pages.push(i);
}

const pages = [...new Set(_pages)];
</script>

<template>
  <ul class="flex flex-wrap gap-2 justify-center mt-8">
    <li
      v-for="(num, key) in pages"
      :key="`page-${num}`"
      :class="['group', 'flex', num === currentPage ? 'is-active' : '']"
    >
      <span
        v-if="pages[key - 1] && pages[key - 1] !== num - 1"
        class="block mr-2"
        >...</span
      >
      <NuxtLink
        :to="`/${props.page}/page/${num}/`"
        class="block border border-black px-2 py-1 group-[.is-active]:bg-gray-100 sm:hover:bg-gray-100"
      >
        {{ num }}
      </NuxtLink>
    </li>
  </ul>
</template>
