<script setup lang="ts">
import type { EventStatus } from '~/types/event_status';
import type { Tag } from '~/types/tag';
import type { RouteLocationAsPath } from 'vue-router'; // Import the RouteLocation type from the appropriate module

const slots = useSlots();
const props = withDefaults(
  defineProps<{
    to: string | RouteLocationAsPath;
    title: string;
    thumbnailSrc?: string | false;
    recommended?: boolean;
    excerpt?: string;
    published?: string;
    attachedInfo?: string[];
    no?: string;
    status?: EventStatus;
    eventTags?: Tag[] | false;
    filmTags?: Tag[] | false;
    addClass?: string;
  }>(),
  {
    to: undefined,
    title: '',
    thumbnailSrc: '',
    recommended: false,
    excerpt: '',
    published: '',
    attachedInfo: undefined,
    no: '',
    status: undefined,
    eventTags: false,
    filmTags: false,
    addClass: '',
  },
);
const isHovered = ref(false);
</script>

<template>
  <NuxtLink
    :to="props.to"
    class="relative block border border-black sm:hover:bg-gray-100"
    :class="props.addClass"
    @mouseover="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div v-if="!!slots.thumbnail" class="border-b border-black">
      <slot name="thumbnail" />
    </div>
    <div v-if="props.thumbnailSrc" class="bg-white border-b border-black">
      <img :src="props.thumbnailSrc" alt="" />
    </div>
    <div class="p-4">
      <EmojiRecommended v-if="props.recommended" class="mb-1" />
      <ArticleHeaderTags
        :status="props.status"
        :film-tags="props.filmTags"
        :event-tags="props.eventTags"
        :no="props.no"
      />
      <H3>{{ props.title }}</H3>
      <p v-if="props.excerpt" class="mt-2" v-html="props.excerpt" />
      <AttachedInfo v-if="props.attachedInfo" :info="props.attachedInfo" />
      <PublishedDate v-if="props.published" :date-time="props.published" />
    </div>
  </NuxtLink>
</template>
