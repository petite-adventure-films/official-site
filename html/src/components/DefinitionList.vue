<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    list: { index: string; text: string | string[] }[];
  }>(),
  {
    list: () => [],
  },
);
</script>

<template>
  <dl>
    <div
      v-for="detail in props.list"
      :key="`${detail}-${detail.index}`"
      class="flex flex-wrap gap-x-1 [&>dt]:after:content-[':']"
    >
      <dt class="flex gap-x-1 items-center">{{ detail.index }}</dt>
      <div
        v-if="Array.isArray(detail.text)"
        class="inline-flex flex-wrap gap-x-1 [&_dd:not(:last-of-type)]:after:content-['、']"
      >
        <dd v-for="text in detail.text" :key="text">{{ text }}</dd>
      </div>
      <dd v-else>{{ detail.text }}</dd>
    </div>
  </dl>
</template>
