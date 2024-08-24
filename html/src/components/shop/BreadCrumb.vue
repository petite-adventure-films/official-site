<script setup lang="ts">
type Crumb = {
  to?: string;
  name?: string;
};
const props = withDefaults(
  defineProps<{
    crumbs?: Crumb[];
  }>(),
  {
    crumbs: () => [],
  },
);
</script>

<template>
  <nav aria-label="Breadcrumb">
    <ul
      class="flex gap-1 flex-wrap text-xs text-gray-500 [&_li]:flex [&_li]:gap-1 [&_li]:items-center"
    >
      <li>
        <NuxtLink to="/pafshop" class="link-text">SHOP</NuxtLink>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-3"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m8.25 4.5 7.5 7.5-7.5 7.5"
          />
        </svg>
      </li>
      <li v-for="crumb in props.crumbs" :key="`crumb-${crumb.name}`">
        <NuxtLink v-if="crumb.to" :to="crumb.to" class="link-text">{{
          crumb.name
        }}</NuxtLink>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-3"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m8.25 4.5 7.5 7.5-7.5 7.5"
          />
        </svg>
      </li>
    </ul>
  </nav>
</template>
