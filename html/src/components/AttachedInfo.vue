<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    info: string[];
  }>(),
  {
    info: undefined,
  },
);
</script>

<template>
  <div v-if="props.info" class="flex flex-wrap gap-x-2 mt-2 text-xs">
    <span v-for="(value, key) in props.info" :key="`info${key}`">
      #{{ value }}
    </span>
  </div>
</template>
