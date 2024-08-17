<script setup lang="ts">
import type { Blog } from '~/types/blog';

definePageMeta({
  layout: false,
});

const route = useRoute();
const pageName = route.params.pageName as string;
const { detail } = await useWpGetListDetail<Blog>('blog_detail', { pageName });
route.meta.title = detail.value?.data.title || 'BLOG';
</script>

<template>
  <NuxtLayout name="post">
    <template #breadcrumb>
      <BreadCrumb :crumbs="[{ to: '/blog/', name: 'BLOG' }]" />
    </template>
    <template v-if="detail" #headerTags>
      <EmojiRecommended v-if="detail && detail.data.recommended" class="mb-1" />
      <ArticleHeaderTags :film-tags="detail.data.film_tags" />
    </template>
    <template v-if="detail" #h2>
      {{ detail.data.title }}
    </template>
    <AttachedInfo
      v-if="detail && detail.data.categories"
      :info="detail.data.categories.map((c) => c.name)"
    />
    <ArticleContents v-if="detail" :contents="detail.data.content" />
    <PublishedDate
      v-if="detail"
      :date-time="detail.data.published"
      class="mt-8"
    />
  </NuxtLayout>
</template>
