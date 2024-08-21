<script setup lang="ts">
import type { News } from '~/types/news';

const route = useRoute();
definePageMeta({
  layout: false,
  title: 'お知らせ',
});

const page = route.params.page as string;
const { posts } = await useWpGetList<News>('news', {
  query: { page },
});
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
      <Pager
        page="news"
        :total-pages="posts.total_pages"
        :current-page="page"
      />
    </div>
  </NuxtLayout>
</template>
