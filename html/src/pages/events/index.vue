<script setup lang="ts">
import type { EventList } from '~/types/event';

definePageMeta({
  layout: false,
});

const route = useRoute();
route.meta.title = 'イベント・上映会';

const { posts } = await useWpGetListCustom<EventList>('events');
const getDefaultTabIndex = ref(0);

watch(posts, async () => {
  const thisYear = new Date().getFullYear();
  const thisMonth = new Date().getMonth() + 1;
  let index = 0;
  if (posts.value.data && posts.value.data[thisYear]) {
    for (const month in posts.value.data[thisYear]) {
      if (Number(month) === thisMonth) {
        getDefaultTabIndex.value = index;
      }
      index++;
    }
  }
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
      :default-index="getDefaultTabIndex"
    >
      <HeadlessTabList>
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
                'block border border-black px-2 py-1 text-gray-500',
                `${selected ? 'bg-gray-100' : ''} sm:hover:bg-gray-100`,
              ]"
              >{{ month }}</span
            >
          </HeadlessTab>
        </div>
      </HeadlessTabList>
      <HeadlessTabPanels class="mt-8">
        <div v-for="(months, year) in posts.data" :key="`events-tab-${year}`">
          <HeadlessTabPanel
            v-for="(list, month) in months"
            :key="`events-tab-panel-${year}-${month}`"
          >
            <ArchiveList>
              <li v-for="data in list" :key="`event-${data.id}`">
                <PostCard
                  :to="`/events/${data.id}`"
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
