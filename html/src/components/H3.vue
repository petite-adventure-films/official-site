<script setup lang="ts">
const slots = useSlots();
</script>

<template>
  <h3>
    <span class="font-bold"><slot /></span>
    <span v-if="!!slots.sub" class="block text-xs">
      <slot name="sub" />
    </span>
  </h3>
</template>
