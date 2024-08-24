<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    publishedDate: Date;
  }>(),
  {
    publishedDate: undefined,
  },
);
</script>

<template>
  <div class="mt-2 text-xs text-gray-500">
    <time :date-time="props.publishedDate">
      {{ props.publishedDate }}
    </time>
  </div>
</template>
