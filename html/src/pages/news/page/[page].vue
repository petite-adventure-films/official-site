<script setup lang="ts">
import type { News } from '~/types/news';
import META from '~/constants/meta.json';

definePageMeta({
  layout: false,
  title: 'お知らせ',
});

const config = useRuntimeConfig();
const route = useRoute();

route.meta.title = 'お知らせ';
useSeoMeta({
  description: META.news,
  ogDescription: META.news,
  ogUrl: `${config.public.SITE_URL}news/`,
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
