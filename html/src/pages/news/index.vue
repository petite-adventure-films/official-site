<script setup lang="ts">
import type { News } from '~/types/news';
definePageMeta({
  title: 'お知らせ',
  layout: false,
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
      <Pager page="news" :total-pages="posts.total_pages" current-page="1" />
    </div>
  </NuxtLayout>
</template>
