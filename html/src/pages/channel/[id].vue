<script setup lang="ts">
import META from '~/constants/meta.json';
import type { Channel } from '~/types/channel';

definePageMeta({
  layout: false,
});

const config = useRuntimeConfig();
const route = useRoute();
const pageId = route.params.id as string;

const { detail } = await useWpGetListDetail<Channel>('channel_detail', {
  pageId,
});
const youtubeId = useGetYouTubeId(detail.value.data.youtube_id);

route.meta.title = `${detail.value?.data.title} - チャンネル`;
useSeoMeta({
  description: META.channel,
  ogDescription: META.channel,
  ogUrl: `${config.public.SITE_URL}channel/${detail.value?.data.id}/`,
});
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
    <Video v-if="detail && youtubeId" :youtube-id="youtubeId" />
    <AttachedInfo
      v-if="detail"
      :info="[
        detail.data.created_country,
        detail.data.created_year,
        detail.data.running_time,
      ]"
    />
    <ArticleContents v-if="detail" :contents="detail.data.content" />
    <PublishedDate
      v-if="detail"
      :published-date="detail.data.published"
      class="mt-8"
    />
  </NuxtLayout>
</template>
