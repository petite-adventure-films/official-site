<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    href: string;
  }>(),
  {
    href: '',
  },
);
</script>

<template>
  <NuxtLink
    :href="props.href"
    target="_blank"
    class="inline-flex items-center link-text"
  >
    <slot />
  </NuxtLink>
</template>
