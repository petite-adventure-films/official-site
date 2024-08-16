<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    info: string[];
  }>(),
  {
    info: undefined,
  },
);

const stripHtmlTag = (str: string) => {
  if (str === null || str === '') return false;
  return str.replace(/(<([^>]+)>)/gi, '');
};
</script>

<template>
  <div v-if="props.info" class="flex flex-wrap gap-x-2 mt-2 text-xs">
    <span
      v-for="(value, key) in props.info"
      :key="`info${key}`"
      class="before:content-['#'] before:pr-[1px]"
    >
      {{ stripHtmlTag(value) }}
    </span>
  </div>
</template>
