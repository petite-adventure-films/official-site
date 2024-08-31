<script setup lang="ts">
import type { Channel } from '~/types/channel';

definePageMeta({
  layout: false,
});

const config = useRuntimeConfig();
const route = useRoute();

route.meta.title = 'チャンネル';
useSeoMeta({
  ogUrl: `${config.public.SITE_URL}channel/`,
});

const { posts } = await useWpGetList<Channel>('channel', {
  query: { per_page: -1 },
});
</script>

<template>
  <NuxtLayout name="post">
    <template #breadcrumb>
      <BreadCrumb />
    </template>
    <template #h2>チャンネル</template>
    <template #lead>
      <p>
        これまでにYouTubeで公開した映像の中から、厳選した動画をご紹介します。<br />
        プチ・アドベンチャー・フィルムズのYouTube全動画は<NuxtLink
          href="https://www.youtube.com/user/petiteadventurefilms"
          rel="noopener noreferrer"
          target="_blank"
          class="link-text"
          >こちら</NuxtLink
        >から
      </p>
    </template>
    <ArchiveList v-if="posts">
      <li v-for="data in posts.data" :key="data.id">
        <PostCard
          :to="`/channel/${data.id}/`"
          :film-tags="data.film_tags"
          :title="data.title"
          :thumbnail-src="`https://img.youtube.com/vi/${data.youtube_id}/maxresdefault.jpg`"
          :attached-info="[
            data.created_country,
            data.created_year,
            data.running_time,
          ]"
        />
      </li>
    </ArchiveList>
  </NuxtLayout>
</template>
