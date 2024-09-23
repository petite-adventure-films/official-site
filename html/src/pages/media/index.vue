<script setup lang="ts">
import type { Media } from '~/types/media';
import META  from '~/constants/meta.json';

definePageMeta({
  layout: false,
});

const config = useRuntimeConfig();
const route = useRoute();

route.meta.title = 'メディア紹介';
useSeoMeta({
  description: META.media,
  ogDescription: META.media,
  ogUrl: `${config.public.SITE_URL}media/`,
});

const { posts } = await useWpGetList<Media>('media', {
  query: { per_page: -1 },
});
</script>

<template>
  <NuxtLayout name="post">
    <template #breadcrumb>
      <BreadCrumb />
    </template>
    <template #h2>メディア紹介</template>
    <ArchiveList v-if="posts">
      <li v-for="data in posts.data" :key="data.id">
        <PostCard
          :to="`/media/${data.id}/`"
          :title="data.title"
          :film-tags="data.film_tags"
          :attached-info="[
            data.media_name,
            data.media_volume,
            data.media_contents,
          ]"
        />
      </li>
    </ArchiveList>
  </NuxtLayout>
</template>
