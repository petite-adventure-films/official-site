<script setup lang="ts">
import MEGA from '~/constants/meta.json';
import type { Channel } from '~/types/channel';

definePageMeta({
  layout: false,
});

const config = useRuntimeConfig();
const route = useRoute();

route.meta.title = 'チャンネル';
useSeoMeta({
  description: MEGA.channel,
  ogDescription: MEGA.channel,
  ogUrl: `${config.public.SITE_URL}channel/`,
});

const { posts } = await useWpGetList<Channel>('channel', {
  query: { per_page: -1 },
});
const channels = computed(() =>
  (posts.value?.data ?? []).map((channel) => ({
    ...channel,
    thumbnailSrc: `https://img.youtube.com/vi/${useGetYouTubeId(channel.youtube_id)}/maxresdefault.jpg`,
  })),
);
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
      <li v-for="channel in channels" :key="channel.id">
        <PostCard
          :to="`/channel/${channel.id}/`"
          :film-tags="channel.film_tags"
          :title="channel.title"
          :thumbnail-src="channel.thumbnailSrc"
          :attached-info="[
            channel.created_country,
            channel.created_year,
            channel.running_time,
          ]"
        />
      </li>
    </ArchiveList>
  </NuxtLayout>
</template>
