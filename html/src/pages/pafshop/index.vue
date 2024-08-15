<script lang="ts" setup>
import type { DVD_detail } from '~/types/dvd';
import { PRODUCTS_DVD } from '~/constants/products_dvd';

definePageMeta({
  title: 'SHOP',
  layout: false,
});

const { posts } = await useWpGetList<DVD_detail>('dvd');

const attachedInfo = ref<{ [key: string]: string }>({});

onMounted(() => {
  if (posts.value && posts.value.data && posts.value.data.length > 0) {
    for (const post of posts.value.data) {
      if (post.catch) {
        attachedInfo.value[post.name] = post.catch;
      }
    }
  }
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
          :excerpt="attachedInfo[product.name]"
        >
          <template #thumbnail>
            <img :src="useAsset(`pafshop/${product.name}_1.jpg`)" alt="" />
          </template>
        </PostCard>
      </li>
    </ul>
  </NuxtLayout>
</template>
