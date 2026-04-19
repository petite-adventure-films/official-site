<script setup lang="ts">
import META from '~/constants/meta.json';
import type { EventList } from '~/types/event';

definePageMeta({
  layout: false,
});

const config = useRuntimeConfig();
const route = useRoute();

route.meta.title = 'イベント・上映会';
useSeoMeta({
  description: META.events,
  ogDescription: META.events,
  ogUrl: `${config.public.SITE_URL}events/`,
});

const { posts } = await useWpGetListCustom<EventList>('events');

const latestEvents = computed(() => {
  const flattened = [];
  if (posts.value.data) {
    for (const year in posts.value.data) {
      for (const month in posts.value.data[year]) {
        const filteredData = posts.value.data[year][month].filter((event) => {
          const eventDate = new Date(event.date_to || event.date_from);
          return eventDate >= new Date();
        });
        flattened.push(...filteredData);
      }
    }
  }
  return flattened.reverse();
});
</script>

<template>
  <NuxtLayout name="post">
    <template #breadcrumb>
      <BreadCrumb />
    </template>
    <template #h2>イベント・上映会</template>
    <HeadlessTabGroup
      v-if="posts && posts.data && Object.keys(posts.data).length > 0"
      as="div"
      :default-index="0"
    >
      <HeadlessTabList class="flex flex-wrap gap-2">
        <HeadlessTab v-slot="{ selected }">
          <span
            :class="[
              'block border border-black px-2 py-1',
              `${selected ? 'bg-gray-100' : ''} sm:hover:bg-gray-100`,
            ]"
            >最新</span
          >
        </HeadlessTab>
        <div
          v-for="(months, year) in posts.data"
          :key="`events-tab-${year}`"
          class="flex gap-2 items-center"
        >
          <span>{{ year }}</span>
          <HeadlessTab
            v-for="(_, month) in months"
            :key="`events-tab-${month}`"
            v-slot="{ selected }"
          >
            <span
              :class="[
                'block border border-black px-2 py-1',
                `${selected ? 'bg-gray-100' : ''} sm:hover:bg-gray-100`,
              ]"
              >{{ month }}</span
            >
          </HeadlessTab>
        </div>
      </HeadlessTabList>
      <HeadlessTabPanels class="mt-8">
        <HeadlessTabPanel>
          <ArchiveList v-if="latestEvents.length > 0">
            <li v-for="data in latestEvents" :key="`event-${data.id}`">
              <PostCard
                :to="`/events/${data.id}/`"
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
          <p v-else>ただ今、予定の上映会・イベントがありません</p>
        </HeadlessTabPanel>
        <div v-for="(months, year) in posts.data" :key="`events-tab-${year}`">
          <HeadlessTabPanel
            v-for="(list, month) in months"
            :key="`events-tab-panel-${year}-${month}`"
          >
            <ArchiveList>
              <li v-for="data in list" :key="`event-${data.id}`">
                <PostCard
                  :to="`/events/${data.id}/`"
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
          </HeadlessTabPanel>
        </div>
      </HeadlessTabPanels>
    </HeadlessTabGroup>
    <p v-else>ただ今、予定の上映会・イベントがありません</p>
    <template #aside>
      <EventsArchiveList />
    </template>
  </NuxtLayout>
</template>
