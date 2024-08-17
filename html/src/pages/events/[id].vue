<script setup lang="ts">
import type { Event } from '~/types/event';

definePageMeta({
  layout: false,
});

const route = useRoute();
const pageId = route.params.id as string;
const { detail } = await useWpGetListDetail<Event>('events_detail', {
  pageId,
});
route.meta.title = detail.value?.data.title || 'イベント・上映会';
const dateFrom = new Date(detail.value?.data.date_from);
const from =
  dateFrom.getFullYear() < new Date().getFullYear()
    ? dateFrom.getFullYear()
    : null;

const getBreadCrumbs = () => {
  const crumbs = [{ to: '/events/', name: 'イベント・上映会' }];
  if (from) {
    crumbs.push({
      to: `/events/archive/${from}/`,
      name: `${from}年のイベント・上映会`,
    });
  }
  return crumbs;
};
</script>

<template>
  <NuxtLayout name="post">
    <template #breadcrumb>
      <BreadCrumb :crumbs="getBreadCrumbs()" />
    </template>
    <template v-if="detail" #headerTags>
      <ArticleHeaderTags
        :status="detail.data.status"
        :film-tags="detail.data.film_tags"
        :event-tags="detail.data.event_tags"
        :no="detail.data.no"
      />
    </template>
    <template v-if="detail" #h2>{{ detail.data.title }}</template>
    <dl v-if="detail" class="[&>dt:not(:first-child)]:mt-8 [&>dt]:font-bold">
      <div v-if="detail.data.dates_details">
        <dt>開催期間</dt>
        <dd class="[&_a]:link-text" v-html="detail.data.dates_details" />
      </div>
      <div v-if="detail.data.place">
        <dt>開催場所</dt>
        <dd>
          <p>
            <span class="[&_a]:link-text" v-html="detail.data.place" /><br />
            <span class="[&_a]:link-text" v-html="detail.data.address" />
            <ExternalLink
              v-if="detail.data.map"
              :href="detail.data.map"
              class="ml-1"
              >MAP</ExternalLink
            >
          </p>
          <p class="[&_a]:link-text" v-html="detail.data.access_details" />
        </dd>
      </div>
      <div v-if="detail.data.fee_details">
        <dt>入場料</dt>
        <dd class="[&_a]:link-text" v-html="detail.data.fee_details" />
      </div>
      <div v-if="detail.data.host_details">
        <dt>主催者</dt>
        <dd class="[&_a]:link-text" v-html="detail.data.host_details" />
      </div>
      <div v-if="detail.data.appendix_contents">
        <dt>備考</dt>
        <dd class="[&_a]:link-text" v-html="detail.data.appendix_contents" />
      </div>
    </dl>
  </NuxtLayout>
</template>
