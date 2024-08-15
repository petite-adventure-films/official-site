<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    direction?: 'row' | 'column' | 'grid';
    addClass?: string;
  }>(),
  {
    direction: 'column',
    addClass: '',
  },
);

const style = computed(() => {
  let style = '[&>li:not(:first-child)]:mt-8';
  if (props.direction === 'row') {
    style = '[&>li:not(:first-child)]:ml-8';
  }
  if (props.direction === 'grid') {
    style = '';
  }
  return style;
});
</script>

<template>
  <ul :class="[style, props.addClass]">
    <slot />
  </ul>
</template>
