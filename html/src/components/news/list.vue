<script setup lang="ts">
import type { News } from '~/types/news';

const props = withDefaults(
  defineProps<{
    posts?: News[];
  }>(),
  {
    posts: undefined,
  },
);
</script>

<template>
  <li v-for="post in props.posts" :key="post.id">
    <H3>{{ post.title }}</H3>
    <ArticleContents :contents="post.content" margin-top="mt-2" />
    <PublishedDate
      :published-date="post.published"
      :updated-date="post.updated"
    />
  </li>
</template>
