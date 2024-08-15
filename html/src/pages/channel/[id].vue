<script setup lang="ts">
import type { Channel } from '~/types/channel';

definePageMeta({
  title: 'チャンネル',
  layout: false,
});

const route = useRoute();
const pageId = route.params.id as string;
const { detail } = await useWpGetListDetail<Channel>('channel_detail', {
  pageId,
});
route.meta.title = detail.value?.data.title || 'チャンネル';
</script>

<template>
  <NuxtLayout name="post">
    <template #breadcrumb>
      <BreadCrumb :crumbs="[{ to: '/channel/', name: 'チャンネル' }]" />
    </template>
    <template v-if="detail" #headerTags>
      <ArticleHeaderTags :film-tags="detail.data.film_tags" />
    </template>
    <template v-if="detail" #h2>{{ detail.data.title }}</template>
    <Video v-if="detail" :youtube-id="detail.data.youtube_id" />
    <AttachedInfo
      v-if="detail"
      :info="[
        detail.data.created_country,
        detail.data.created_year,
        detail.data.running_time,
      ]"
    />
    <ArticleContents v-if="detail" :contents="detail.data.content" />
    <PublishedDate v-if="detail" :date-time="detail.data.published" />
  </NuxtLayout>
</template>
