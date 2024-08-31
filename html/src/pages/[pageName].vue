<script setup lang="ts">
import type { Blog } from '~/types/blog';

definePageMeta({
  layout: false,
});

const config = useRuntimeConfig();
const route = useRoute();

const pageName = route.params.pageName as string;
const { detail } = await useWpGetListDetail<Blog>('blog_detail', { pageName });

route.meta.title = `${detail.value?.data.title} - 'BLOG`;
useSeoMeta({
  ogUrl: `${config.public.SITE_URL}${pageName}/`,
});
</script>

<template>
  <NuxtLayout name="post">
    <template #breadcrumb>
      <BreadCrumb :crumbs="[{ to: '/blog/', name: 'BLOG' }]" />
    </template>
    <template v-if="detail" #headerTags>
      <EmojiRecommended
        v-if="detail && detail.data.recommended === '1'"
        class="mb-1"
      />
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
      :published-date="detail.data.published"
      class="mt-8"
    />
  </NuxtLayout>
</template>
