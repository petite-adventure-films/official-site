<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    contents: string;
    marginTop?: string;
  }>(),
  {
    contents: '',
    marginTop: 'mt-8',
  },
);
</script>

<template>
  <div
    :class="`${marginTop} [&_p:has(iframe)]:aspect-video [&_iframe]:w-full [&_iframe]:h-full [&_a]:link-text [&_img]:mt-2`"
    v-html="props.contents"
  />
</template>
