<script lang="ts" setup>
import { PRODUCTS_DVD } from '~/constants/products_dvd';

definePageMeta({
  layout: false,
});

const config = useRuntimeConfig();

useSeoMeta({
  ogUrl: `${config.public.SITE_URL}pafshop/`,
});
</script>

<template>
  <NuxtLayout name="shop">
    <ul class="grid grid-cols-1 gap-8">
      <li v-for="product in PRODUCTS_DVD" :key="product.id">
        <PostCard
          :to="`/pafshop/${product.name}/`"
          :title="product.title"
          :show-read-more="false"
          :excerpt="product.catch"
        >
          <template #thumbnail>
            <img :src="useAsset(`pafshop/${product.name}_1.jpg`)" alt="" />
          </template>
        </PostCard>
      </li>
    </ul>
  </NuxtLayout>
</template>
