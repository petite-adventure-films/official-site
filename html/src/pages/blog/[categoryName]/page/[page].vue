<script setup lang="ts">
import type { Blog } from '~/types/blog';

definePageMeta({
  layout: false,
});

const config = useRuntimeConfig();

const route = useRoute();
const categoryName = route.params.categoryName as string;

route.meta.title = `${categoryName} - BLOG`;
useSeoMeta({
  ogUrl: `${config.public.SITE_URL}blog/${categoryName}`,
});

const page = route.params.page as string;
const { posts } = await useWpGetList<Blog>('blog', {
  query: { page, category_name: categoryName },
});
</script>

<template>
  <NuxtLayout name="post">
    <template #breadcrumb>
      <BreadCrumb :crumbs="[{ to: '/blog/', name: 'BLOG' }]" />
    </template>
    <template #h2>{{ categoryName }}</template>
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
        :page="`blog/${categoryName}`"
        :total-pages="posts.total_pages"
        :current-page="page"
      />
    </div>
    <template #aside>
      <BlogCategories :current-category="categoryName" />
    </template>
  </NuxtLayout>
</template>
