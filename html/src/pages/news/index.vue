<script setup lang="ts">
import type { News } from '~/types/news';
definePageMeta({
  title: '新着情報',
  layout: false,
});
const { posts } = await useWpGetList<News>('news');
</script>

<template>
  <NuxtLayout name="post">
    <template #breadcrumb>
      <BreadCrumb />
    </template>
    <template #h2>新着情報</template>
    <div v-if="posts">
      <ArchiveList>
        <NewsList :posts="posts.data" />
      </ArchiveList>
      <Pager page="news" :total-pages="posts.total_pages" current-page="1" />
    </div>
  </NuxtLayout>
</template>
