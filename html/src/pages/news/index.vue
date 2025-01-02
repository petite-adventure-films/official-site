<script setup lang="ts">
import META from '~/constants/meta.json';
import type { News } from '~/types/news';

definePageMeta({
  layout: false,
});

const config = useRuntimeConfig();
const route = useRoute();

route.meta.title = 'お知らせ';
useSeoMeta({
  description: META.news,
  ogDescription: META.news,
  ogUrl: `${config.public.SITE_URL}news/`,
});

const { posts } = await useWpGetList<News>('news');
</script>

<template>
  <NuxtLayout name="post">
    <template #breadcrumb>
      <BreadCrumb />
    </template>
    <template #h2>お知らせ</template>
    <div v-if="posts">
      <ArchiveList>
        <NewsList :posts="posts.data" />
      </ArchiveList>
    </div>
    <template #aside>
      <NewsArchiveList />
    </template>
  </NuxtLayout>
</template>
