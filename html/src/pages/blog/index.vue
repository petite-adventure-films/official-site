<script setup lang="ts">
import type { Blog } from '~/types/blog';

definePageMeta({
  layout: false,
});

const config = useRuntimeConfig();
const route = useRoute();

route.meta.title = 'BLOG';
useSeoMeta({
  ogUrl: `${config.public.SITE_URL}blog/`,
});

const { posts } = await useWpGetList<Blog>('blog');
</script>

<template>
  <NuxtLayout name="post">
    <template #breadcrumb>
      <BreadCrumb />
    </template>
    <template #h2>BLOG</template>
    <template #lead>
      <BlogTab />
    </template>
    <div v-if="posts">
      <ArchiveList>
        <li v-for="data in posts.data" :key="data.id">
          <PostCard
            :to="`/${data.name}/`"
            :title="data.title"
            :thumbnail-src="data.thumbnail"
            :published="data.published"
            :recommended="data.recommended === '1' ? true : false"
            :film-tags="data.film_tags"
            :attached-info="data.categories.map((c) => c.name)"
          />
        </li>
      </ArchiveList>
      <Pager page="blog" :total-pages="posts.total_pages" current-page="1" />
    </div>
    <template #aside>
      <BlogCategories />
    </template>
  </NuxtLayout>
</template>
