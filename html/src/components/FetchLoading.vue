<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    status: ReturnType<typeof useFetch>['status'];
    idle?: boolean;
    number?: number;
  }>(),
  {
    status: '',
    idle: false,
    number: 1,
  },
);

const loading = computed(
  () => props.status === 'pending' || (props.idle && props.status === 'idle'),
);
</script>

<template>
  <div v-if="loading">
    <div
      v-for="index in number"
      :key="index"
      role="status"
      class="mt-8 animate-pulse"
    >
      <div class="w-full">
        <div class="h-2.5 bg-gray-200 rounded-full w-48 mb-4" />
        <div class="h-2 bg-gray-200 rounded-full max-w-[480px] mb-2.5" />
        <div class="h-2 bg-gray-200 rounded-full mb-2.5" />
        <div class="h-2 bg-gray-200 rounded-full max-w-[440px] mb-2.5" />
        <div class="h-2 bg-gray-200 rounded-full max-w-[460px] mb-2.5" />
        <div class="h-2 bg-gray-200 rounded-full max-w-[360px]" />
      </div>
    </div>
  </div>
</template>
