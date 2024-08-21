<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    to?: string;
    type?: 'primary' | 'secondary' | 'shop';
  }>(),
  {
    to: '',
    type: 'primary',
  },
);
</script>

<template>
  <NuxtLink
    :to="props.to"
    :class="[
      'inline-flex gap-2 items-center px-6 py-4 text-base font-medium',
      props.type === 'primary'
        ? 'border border-black text-white bg-blue-600 sm:hover:bg-gray-100 sm:hover:border-blue-600 sm:hover:text-blue-600'
        : '',
      props.type === 'secondary'
        ? 'border border-blue-600 text-blue-600 sm:hover:bg-gray-100'
        : '',
      props.type === 'shop'
        ? 'border border-black bg-purple-600 text-purple-50 sm:hover:bg-purple-100 sm:hover:text-purple-600 sm:hover:border-purple-600'
        : '',
    ]"
  >
    <span><slot /></span>
  </NuxtLink>
</template>
