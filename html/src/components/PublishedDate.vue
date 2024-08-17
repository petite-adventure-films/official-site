<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    dateTime: string;
  }>(),
  {
    dateTime: '',
  },
);
</script>

<template>
  <div>
    <time class="block mt-2 text-xs text-gray-500" :datetime="props.dateTime">
      {{ props.dateTime }}
    </time>
  </div>
</template>
