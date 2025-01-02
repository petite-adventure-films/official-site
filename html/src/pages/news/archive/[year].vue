<script setup lang="ts">
import META from '~/constants/meta.json';
import NEWS_ARCHIVE from '~/constants/static/news.json';
import type { News } from '~/types/news';

const NEWS_ARCHIVE_DATA: News[] = NEWS_ARCHIVE.data;

definePageMeta({
  layout: false,
});

const config = useRuntimeConfig();
const route = useRoute();

const year = route.params.year as string;

const list = NEWS_ARCHIVE_DATA.filter((item) => {
  const publishedYear = new Date(item.published).getFullYear();
  return publishedYear === Number(year);
});

route.meta.title = `${year}年 - お知らせ`;
useSeoMeta({
  description: META['news/archive'].replace('%s', year),
  ogDescription: META['news/archive'].replace('%s', year),
  ogUrl: `${config.public.SITE_URL}news/archive/${year}/`,
});
</script>

<template>
  <NuxtLayout name="post">
    <template #breadcrumb>
      <BreadCrumb :crumbs="[{ to: '/news/', name: 'お知らせ' }]" />
    </template>
    <template #h2>{{ year }}年のイベント・上映会</template>
    <ArchiveList>
      <NewsList :posts="list" />
    </ArchiveList>
    <template #aside>
      <NewsArchiveList :current-year="Number(year)" />
    </template>
  </NuxtLayout>
</template>
