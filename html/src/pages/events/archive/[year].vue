<script setup lang="ts">
import type { Event } from '~/types/event';
import META from '~/constants/meta.json';

definePageMeta({
  layout: false,
});

const config = useRuntimeConfig();
const route = useRoute();

const year = route.params.year as string;

route.meta.title = `${year}年 - イベント・上映会`;
useSeoMeta({
  description: META['events/archive'].replace('%s', year),
  ogDescription: META['events/archive'].replace('%s', year),
  ogUrl: `${config.public.SITE_URL}events/archive/${year}/`,
});

const { posts } = await useWpGetList<Event>('events_archive', {
  query: {
    year,
  },
});
</script>

<template>
  <NuxtLayout name="post">
    <template #breadcrumb>
      <BreadCrumb :crumbs="[{ to: '/events/', name: 'イベント・上映会' }]" />
    </template>
    <template #h2>{{ year }}年のイベント・上映会</template>
    <ArchiveList v-if="posts">
      <li v-for="data in posts.data" :key="`event-${data.id}`">
        <PostCard
          :to="{ path: `/events/${data.id}/` }"
          :title="data.title"
          :no="data.no"
          :status="data.status"
          :film-tags="data.film_tags"
          :event-tags="data.event_tags"
          :attached-info="[
            `${data.date_from}${data.date_to ? ` - ${data.date_to}` : ''}`,
            data.place,
          ]"
        />
      </li>
    </ArchiveList>
    <template #aside>
      <EventsArchiveList :current-year="Number(year)" />
    </template>
  </NuxtLayout>
</template>
