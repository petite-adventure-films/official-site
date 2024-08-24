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
    class="[&_p:has(iframe)]:aspect-video [&_iframe]:w-full [&_iframe]:h-full [&_a]:link-text [&_img]:mt-2 [&_img]:border [&_img]:border-black"
    :class="marginTop"
    v-html="props.contents"
  />
</template>
