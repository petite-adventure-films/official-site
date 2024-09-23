<script setup lang="ts">
import type { Blog } from '~/types/blog';
import META from '~/constants/meta.json';

definePageMeta({
  layout: false,
});

const config = useRuntimeConfig();
const route = useRoute();
const tagName = route.params.tagName as string;

route.meta.title = `${tagName} - BLOG`;
useSeoMeta({
  description: META['blog/tag'].replace('%s', tagName),
  ogDescription: META['blog/tag'].replace('%s', tagName),
  ogUrl: `${config.public.SITE_URL}blog/${tagName}/`,
});

const { posts } = await useWpGetList<Blog>('blog', {
  query: {
    tag: tagName,
  },
});
</script>

<template>
  <NuxtLayout name="post">
    <template #breadcrumb>
      <BreadCrumb :crumbs="[{ to: '/blog/', name: 'BLOG' }]" />
    </template>
    <template #h2>{{ tagName }}</template>
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
      <Pager
        :page="`blog/tag/${tagName}`"
        :total-pages="posts.total_pages"
        current-page="1"
      />
    </div>
    <template #aside>
      <BlogCategories />
    </template>
  </NuxtLayout>
</template>
