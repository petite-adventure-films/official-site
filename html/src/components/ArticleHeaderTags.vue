<script setup lang="ts">
import type { Tag } from '~/types/tag';
import type { EventStatus } from '~/types/event_status';
const props = withDefaults(
  defineProps<{
    status?: EventStatus;
    filmTags?: Tag[] | false;
    eventTags?: Tag[] | false;
    no?: string;
  }>(),
  {
    status: undefined,
    filmTags: false,
    eventTags: false,
    no: undefined,
  },
);
</script>

<template>
  <div
    v-if="props.status || props.filmTags || props.eventTags || props.no"
    class="flex justify-between items-center gap-2 mb-1"
  >
    <div class="flex flex-wrap gap-2">
      <span
        v-if="props.status"
        class="bg-red-600 text-red-100 text-xs px-1.5 py-0.5"
        >{{ props.status === '1' ? '延期' : '中止' }}</span
      >
      <div v-if="props.filmTags" class="flex flex-wrap gap-2">
        <span
          v-for="tag1 in props.filmTags"
          :key="`filmTag${tag1.name}`"
          class="bg-purple-100 text-purple-600 text-xs px-1.5 py-0.5"
          >{{ tag1.name }}</span
        >
      </div>
      <div v-if="props.eventTags" class="flex flex-wrap gap-2">
        <span
          v-for="tag2 in props.eventTags"
          :key="`filmTag${tag2.name}`"
          class="bg-cyan-100 text-cyan-600 text-xs px-1.5 py-0.5"
          >{{ tag2.name }}</span
        >
      </div>
    </div>
    <span v-if="props.no" class="text-xs text-gray-500"> #{{ props.no }} </span>
  </div>
</template>
