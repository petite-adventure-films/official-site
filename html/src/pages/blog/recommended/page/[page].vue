<script setup lang="ts">
import type { Blog } from '~/types/blog';

definePageMeta({
  layout: false,
});

const config = useRuntimeConfig();
const route = useRoute();

route.meta.title = '⭐️おすすめ記事 - BLOG';
useSeoMeta({
  ogUrl: `${config.public.SITE_URL}blog/recommended/`,
});

const page = route.params.page as string;
const { posts } = await useWpGetList<Blog>('blog', {
  query: {
    page,
    meta_key: 'recommend',
    meta_value: '1',
    per_page: 10,
  },
});
</script>

<template>
  <NuxtLayout name="post">
    <template #breadcrumb>
      <BreadCrumb />
    </template>
    <template #h2>BLOG</template>
    <template #lead>
      <BlogTab :is-recommended-list="true" />
    </template>
    <div v-if="posts">
      <ArchiveList>
        <li v-for="data in posts.data" :key="data.id">
          <PostCard
            :to="`/${data.name}/`"
            :title="data.title"
            :thumbnail-src="data.thumbnail"
            :recommended="data.recommended === '1' ? true : false"
            :published="data.published"
            :film-tags="data.film_tags"
            :attached-info="data.categories.map((c) => c.name)"
          />
        </li>
      </ArchiveList>
      <Pager
        page="blog/recommended"
        :total-pages="posts.total_pages"
        :current-page="page"
      />
    </div>
    <template #aside>
      <BlogCategories />
    </template>
  </NuxtLayout>
</template>
