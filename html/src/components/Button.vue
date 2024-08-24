<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    type?: 'primary' | 'secondary' | 'shop' | 'shop-secondary';
    disabled?: boolean;
  }>(),
  {
    type: 'primary',
    disabled: true,
  },
);

const styleOfType = {
  primary:
    'border border-black text-white bg-blue-600 sm:hover:bg-gray-100 sm:hover:border-blue-600 sm:hover:text-blue-600',
  secondary:
    'border border-blue-600 text-blue-600 bg-white sm:hover:bg-gray-100',
  shop: 'border border-black text-white bg-purple-600 sm:hover:bg-gray-100 sm:hover:border-purple-600 sm:hover:text-purple-600',
  'shop-secondary':
    'border border-purple-600 text-purple-600 bg-white sm:hover:bg-gray-100',
};

const btnClass = computed(() => !props.disabled && styleOfType[props.type]);
</script>

<template>
  <button
    :class="[
      'group inline-flex gap-2 items-center px-6 py-4 text-base font-medium min-w-48',
      props.disabled
        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
        : btnClass,
    ]"
    :disabled="props.disabled"
  >
    <span><slot /></span>
  </button>
</template>
