<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    open?: boolean;
  }>(),
  {
    open: false,
  },
);
</script>

<template>
  <HeadlessDialog
    :open="props.open"
    class="flex justify-center items-center fixed z-50 w-full h-full top-0 left-0 bg-white bg-opacity-90"
  >
    <div
      class="overflow-scroll relative flex item-center max-w-screen-sm max-h-[calc(100vh_-_10%)]"
    >
      <HeadlessDialogPanel>
        <slot />
      </HeadlessDialogPanel>
    </div>
  </HeadlessDialog>
</template>
