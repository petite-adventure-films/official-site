<script setup lang="ts">
import type { Film, FilmId } from '~/types/film';
import { FILMS } from '~/constants/film_info';

definePageMeta({
  title: '映画',
  layout: false,
});

const getAttachedInfo = (data: Film) => {
  const info = [];
  data.movie_youtube_id && info.push('ネットで本編公開中');
  (data.national_screenings || data.global_screenings) &&
    info.push('映画祭出品歴あり');
  data.prizes && info.push('受賞歴あり');
  return info;
};
</script>

<template>
  <NuxtLayout name="post">
    <template #breadcrumb>
      <BreadCrumb />
    </template>
    <template #h2>映画</template>
    <ul class="grid grid-cols-1 gap-8">
      <li v-for="data in FILMS" :key="data.id">
        <PostCard
          :to="`/films/${data.film_id}/`"
          :title="data.title"
          :excerpt="data.excerpt"
          :attached-info="getAttachedInfo(data)"
        >
          <template #thumbnail>
            <img
              :src="useAsset(`films/${data.film_id}_thumbnail.jpg`)"
              alt=""
            />
          </template>
        </PostCard>
      </li>
    </ul>
  </NuxtLayout>
</template>
