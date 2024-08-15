<script setup lang="ts">
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  ArrowDownIcon,
} from '@heroicons/vue/24/solid';
const props = withDefaults(
  defineProps<{
    type?: 'primary' | 'secondary' | 'shop' | 'shop-secondary';
    disabled?: boolean;
    direction?: 'left' | 'right' | 'down' | 'up';
  }>(),
  {
    type: 'primary',
    disabled: true,
    direction: undefined,
  },
);

const styleOfType = {
  primary: 'text-white bg-blue-600',
  secondary: 'border border-blue-600 text-blue-600',
  shop: 'text-white bg-purple-600',
  'shop-secondary': 'border border-purple-600 text-purple-600',
};

const btnClass = computed(() => !props.disabled && styleOfType[props.type]);
</script>

<template>
  <button
    :class="[
      'group inline-flex gap-2 items-center px-6 py-4 text-base font-medium min-w-48',
      props.direction === 'left' ? 'justify-end' : '',
      props.disabled
        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
        : btnClass,
    ]"
    :disabled="props.disabled"
  >
    <ArrowLeftIcon
      v-if="props.direction === 'left'"
      class="w-6"
      :class="props.disabled ? '' : 'group-hover:-translate-x-1'"
    />
    <span><slot /></span>
    <ArrowRightIcon
      v-if="props.direction === 'right'"
      class="w-6"
      :class="props.disabled ? '' : 'group-hover:translate-x-1'"
    />
    <ArrowDownIcon
      v-if="props.direction === 'down'"
      class="w-6"
      :class="props.disabled ? '' : 'group-hover:translate-x-1'"
    />
  </button>
</template>
