<script setup lang="ts">
import CATEGORIES from '~/constants/categories.json';
// import type { Blog } from '~/types/blog';

const props = withDefaults(
  defineProps<{
    currentCategory?: string;
  }>(),
  {
    currentCategory: '',
  },
);
</script>

<template>
  <div>
    <H3>カテゴリ</H3>
    <ul>
      <li v-for="category in CATEGORIES" :key="category">
        <NuxtLink
          :to="`/blog/${category}/`"
          :class="[
            'link-text',
            `${props.currentCategory === category ? 'router-link-exact-active' : ''}`,
            '[&.router-link-exact-active]:text-blue-400 [&.router-link-exact-active]:no-underline]',
          ]"
        >
          #{{ category }}</NuxtLink
        >
      </li>
    </ul>
  </div>
</template>
