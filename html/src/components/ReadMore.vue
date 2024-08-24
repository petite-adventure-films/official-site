<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    text?: string;
  }>(),
  {
    text: 'READ MORE',
  },
);
</script>

<template>
  <div
    class="inline-flex gap-2 items-center px-2 border border-black text-xs sm:hover:bg-gray-100"
  >
    <span>{{ props.text }}</span>
  </div>
</template>
