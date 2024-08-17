<script setup lang="ts">
import type { Media } from '~/types/media';

definePageMeta({
  layout: false,
});

const route = useRoute();
const pageId = route.params.id as string;
const { detail } = await useWpGetListDetail<Media>('media_detail', { pageId });
route.meta.title = detail.value?.data.title || 'メディア紹介';
</script>

<template>
  <NuxtLayout name="post">
    <template #breadcrumb>
      <BreadCrumb :crumbs="[{ to: '/media/', name: 'メディア紹介' }]" />
    </template>
    <template v-if="detail" #headerTags>
      <ArticleHeaderTags :film-tags="detail.data.film_tags" />
    </template>
    <template v-if="detail" #h2>{{ detail.data.title }}</template>
    <Video
      v-if="detail && detail.data.media_video"
      :youtube-id="detail.data.media_video"
    />
    <AppPdfViewer
      v-if="detail && detail.data.media_pdf_url"
      :src="detail.data.media_pdf_url"
    />
    <AttachedInfo
      v-if="detail"
      :info="[
        detail.data.media_name,
        detail.data.media_volume,
        detail.data.media_contents,
      ]"
    />
    <ArticleContents v-if="detail" :contents="detail.data.content" />
    <article
      v-if="detail && detail.data.article_title && detail.data.article_contents"
      class="relative mt-8 border border-black py-8 px-4 before:content-['記事本文'] before:text-xs before:px-2 before:py-1 before:bg-gray-100 before:absolute before:right-0 before:top-0"
    >
      <H3
        :text="detail.data.article_title"
        :sub="detail.data.article_subtitle"
      />
      <div
        v-if="detail.data.article_contents"
        v-html="detail.data.article_contents"
      />
    </article>
    <PublishedDate v-if="detail" :date-time="detail.data.published" />
  </NuxtLayout>
</template>
