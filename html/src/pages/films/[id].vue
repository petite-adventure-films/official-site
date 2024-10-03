<script setup lang="ts">
import type { Film } from '~/types/film';
import { FILMS } from '~/constants/film_info';
import META from '~/constants/meta.json';

definePageMeta({
  layout: false,
});

const config = useRuntimeConfig();
const route = useRoute();

const pageId = route.params.id as string;
const data = ref<Film | undefined>(FILMS.find((f) => f.film_id === pageId));

route.meta.title = `${data.value?.title} - 映画`;
useSeoMeta({
  description: META[`films/${pageId}` as keyof typeof META],
  ogDescription: META[`films/${pageId}` as keyof typeof META],
  ogUrl: `${config.public.SITE_URL}films/${data.value?.id}/`,
});

const galleryImages = [...Array(data.value?.gallery_num).keys()].map((i) =>
  useAsset(`films/${data.value?.film_id}_still_${i + 1}.jpg`),
);
</script>

<template>
  <NuxtLayout name="post">
    <template #breadcrumb>
      <BreadCrumb :crumbs="[{ to: '/films/', name: '映画' }]" />
    </template>
    <template #h2>{{ data?.title }}</template>
    <div class="mb-8">
      <img
        v-if="data?.film_id"
        :src="useAsset(`films/${data?.film_id}_thumbnail.jpg`)"
        alt="thumbnail"
        class="border border-black"
      />
      <p v-if="data?.poster_appendix" class="mt-2 text-xs text-gray-500">
        {{ data.poster_appendix }}
      </p>
    </div>
    <p
      v-for="(item, index) in data?.prizes"
      :key="`${item}-${index}`"
      class="text-xl sm:text-xl text-purple-600 mb-2"
    >
      <span v-html="item" />
    </p>
    <p
      v-if="data?.catch"
      class="text-xl sm:text-xl text-purple-600 mb-2"
      v-html="data.catch"
    />
    <p class="text-xl sm:text-xl" v-html="data?.excerpt" />
    <ul
      class="flex flex-wrap gap-x-2 mt-2 [&>li:not(:first-child)]:before:content-['/']"
    >
      <li
        v-for="info in [
          data?.genre,
          data?.country,
          data?.created_at,
          data?.running_time,
        ]"
        :key="info"
        class="flex gap-2"
      >
        {{ info }}
      </li>
    </ul>
    <dl class="mt-2 mb-4">
      <div
        v-for="detail in data?.details"
        :key="`${detail}-${detail.index}`"
        class="flex flex-wrap gap-x-2 [&>dt]:after:content-[':']"
      >
        <dt class="flex gap-2">{{ detail.index }}</dt>
        <dd>{{ detail.text }}</dd>
      </div>
    </dl>
    <div v-if="data?.has_dvd">
      <ButtonLink
        type="shop"
        :to="`/pafshop/${data?.shop_uri || data?.film_id}/`"
        :disabled="false"
      >
        DVDを購入する
      </ButtonLink>
      <p v-if="data?.has_dvd_appendix" class="mt-2 text-xs text-gray-500">
        {{ data.has_dvd_appendix }}
      </p>
    </div>
    <Section v-if="data?.movie_youtube_id" title="映画本編">
      <Video :youtube-id="data.movie_youtube_id" />
    </Section>
    <Section v-if="data?.recommends" title="推薦の言葉">
      <figure
        v-for="item in data.recommends"
        :key="`${item}-${item.by}`"
        class="mt-4"
      >
        <figcaption>{{ item.by }}</figcaption>
        <blockquote class="mt-2" v-html="item.text" />
      </figure>
    </Section>
    <Section v-if="data?.teaser_youtube_id" title="予告編">
      <Video :youtube-id="data.teaser_youtube_id" />
    </Section>
    <Section title="あらすじ">
      <div v-html="data?.content" />
    </Section>
    <Section v-if="data?.gallery_num" title="ギャラリー">
      <GalleryImage :slide-number="galleryImages.length">
        <template #gallery="{ currentIndex }">
          <div
            v-for="(image, key) in galleryImages"
            :key="`still-${image}`"
            class="pointer-events-none"
            :data-selected="currentIndex === key"
          >
            <img :src="image" />
          </div>
        </template>
      </GalleryImage>
    </Section>
    <Section title="制作クレジット（敬称略）">
      <dl v-if="data?.credits">
        <masonry-wall :items="data.credits" :column-width="224" :gap="16">
          <template #default="{ item }">
            <dt>{{ item.index }}</dt>
            <dd class="mt-2" v-html="item.text" />
          </template>
        </masonry-wall>
      </dl>
    </Section>
    <Section
      v-if="data?.national_screenings || data?.global_screenings"
      title="映画祭上映履歴"
    >
      <div v-if="data.national_screenings">
        <h4>国内</h4>
        <ul class="mt-2">
          <li
            v-for="(item, index) in data.national_screenings"
            :key="`${item}-${index}`"
          >
            {{ item }}
          </li>
        </ul>
      </div>
      <div v-if="data.global_screenings" class="mt-4">
        <h4>海外</h4>
        <ul class="mt-2">
          <li
            v-for="(item, index) in data.global_screenings"
            :key="`${item}-${index}`"
          >
            {{ item }}
          </li>
        </ul>
      </div>
    </Section>
    <Section v-if="data?.media_screenings" title="放映・劇場公開履歴">
      <ul>
        <li
          v-for="(item, index) in data.media_screenings"
          :key="`${item}-${index}`"
        >
          {{ item }}
        </li>
      </ul>
    </Section>
    <Section v-if="data?.related_infomation" title="関連情報（敬称略）">
      <ul class="flex flex-col gap-y-2">
        <li
          v-for="(item, index) in data.related_infomation"
          :key="`${item}-${index}`"
          class="[&_a]:link-text"
          v-html="item"
        />
      </ul>
    </Section>
    <NuxtLink
      v-if="data?.special_page"
      class="block group mt-16"
      :to="data.special_page.to"
    >
      <img
        :src="useAsset(`films/${data.special_page.banner}`)"
        :alt="data.special_page.text"
        class="block sm:group-hover:opacity-75"
      />
    </NuxtLink>
  </NuxtLayout>
</template>
