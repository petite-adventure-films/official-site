<script setup lang="ts">
import type { itemInBasket } from '~/types/item-in-basket';
import type { Film } from '~/types/film';
import { PRODUCTS_DVD } from '~/constants/products_dvd';
import { FILMS } from '~/constants/film_info';

definePageMeta({
  layout: false,
});

const config = useRuntimeConfig();
const route = useRoute();
const router = useRouter();
const pageName = route.params.name as string;

// ショップカートの中
const { basket, updateBasket } = useBasketState();

// dvd情報
const dvd = PRODUCTS_DVD.find((f) => f.name === pageName);
const articleCompontent = `ShopArticle${dvd?.article_component}`;

route.meta.title = `${dvd?.title}`;
useSeoMeta({
  ogUrl: `${config.public.SITE_URL}pafshop/${dvd?.name}/`,
});

// 映画情報
const filmInfo: Film[] = [];
const filmIds = pageName.split('__');
for (const id of filmIds) {
  const film = FILMS.find((f) => f.film_id === id);
  film && filmInfo.push(film);
}

const galleryImages = [...Array(dvd?.image_num).keys()].map((i) =>
  useAsset(`pafshop/${dvd?.name}_${i + 1}.jpg`),
);

const discSpec = computed(() => {
  const spec = [];
  if (dvd?.disc) {
    const structure: string[] = [];
    const type: string[] = [];
    const content: string[] = [];
    for (const key in dvd.disc) {
      const item = dvd.disc[key];
      structure.push(`${item.index}${item.number}組`);
      type.push(`${item.index} ${item.type}`);
      if (content[Number(key) - 1] !== item.content) {
        content.push(item.content);
      }
    }
    spec.push({ index: '構成', text: structure });
    spec.push({ index: 'ディスク種類', text: type });
    spec.push({ index: '収録内容', text: content });
  }
  return spec;
});

const itemsToBasket = computed(() => {
  const items: itemInBasket[] = [];
  for (const price of dvd!.prices) {
    for (const disc of price.disc) {
      const itemInBasket = basket.value.find(
        (item) =>
          item.title === dvd!.title &&
          item.name === dvd!.name &&
          item.type === price.type &&
          item.disc === disc,
      );
      items.push({
        title: dvd!.title,
        name: dvd!.name,
        type: price.type,
        amount: price.amount,
        disc,
        unit: itemInBasket?.unit || 0,
      });
    }
  }
  return items;
});

const isModalOpen = ref(false);

const addItemToBasket = () => {
  updateBasket(itemsToBasket.value);
  isModalOpen.value = true;
};

const moveToBasket = () => {
  isModalOpen.value = false;
  router.push('/pafshop/cart/');
};
</script>

<template>
  <NuxtLayout name="shop">
    <template #breadcrumb>
      <ShopBreadCrumb />
    </template>
    <template #h2>{{ dvd?.title }}</template>
    <GalleryImage :slide-number="galleryImages.length" class="mt-8 md:mt-0">
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
    <div class="mt-8">
      <p class="text-xl sm:text-xl text-purple-600 mb-2" v-html="dvd?.catch" />
      <DefinitionList :list="discSpec" />
      <ul class="mt-4 [&_li:not(:first-of-type)]:mt-2">
        <li
          v-for="(item, key) in itemsToBasket"
          :key="key"
          class="flex gap-2 items-center"
        >
          <span class="flex-1 flex gap-x-1 flex-wrap"
            ><span>{{ item.type }}</span
            ><span v-if="dvd && dvd.disc.length > 1" class="palt">{{
              item.disc
            }}</span>
          </span>
          <span>¥{{ item.amount.toLocaleString() }}</span>
          <select v-model="item.unit" class="border border-black p-1 w-16">
            <option value="0">数量</option>
            <option
              v-for="unit in [...Array(10).keys()]"
              :key="unit"
              :value="unit + 1"
              :selected="Number(unit) + 1 === item.unit"
            >
              {{ unit + 1 }}
            </option>
          </select>
        </li>
      </ul>
      <Button
        class="mt-4 w-full"
        type="shop"
        :disabled="false"
        @click="addItemToBasket()"
        >カートに入れる</Button
      >
      <HeadlessTabGroup>
        <HeadlessTabList class="w-full flex mt-16">
          <HeadlessTab
            v-for="tab in [
              '概要',
              dvd?.article_type === 'main' ? '本編' : '特典',
              '制作クレジット',
            ]"
            :key="tab"
            v-slot="{ selected }"
            as="template"
            class="min-w-fit w-1/3 border-t border-l last:border-r border-black"
          >
            <button
              class="p-2 rounded-none focus:outline-none sm:hover:bg-white sm:hover:text-black"
              :class="[selected ? 'bg-white' : 'bg-gray-100 text-gray-500']"
            >
              {{ tab }}
            </button>
          </HeadlessTab>
        </HeadlessTabList>
        <HeadlessTabPanels>
          <HeadlessTabPanel class="pt-8 [&_p+p]:mt-2">
            <div
              v-for="info in filmInfo"
              :key="info.film_id"
              class="[&:not(:first-child)]:mt-4"
            >
              <h4 v-if="filmInfo.length > 1" class="mb-2 font-bold">
                {{ info.title }}
              </h4>
              <p>監督: {{ info.director }}</p>
              <ul
                class="flex flex-wrap gap-x-2 [&>li:not(:first-child)]:before:content-['/']"
              >
                <li
                  v-for="item in [
                    info?.genre,
                    info?.country,
                    info?.created_at,
                    info?.running_time,
                  ]"
                  :key="item"
                  class="flex gap-2"
                >
                  {{ item }}
                </li>
              </ul>
            </div>
            <div class="mt-8" v-html="dvd?.intro" />
          </HeadlessTabPanel>
          <HeadlessTabPanel class="pt-8">
            <component
              :is="articleCompontent"
              class="[&_h4]:mt-4 [&_p]:mt-2 [&_figure]:block [&_figure]:mt-2 [&_figcaption]:mt-1 [&_figcaption]:text-xs [&_img]:block [&_img]:mt-2 [&_img]:border [&_img]:border-black"
            />
          </HeadlessTabPanel>
          <HeadlessTabPanel class="pt-8">
            <div
              v-for="info in filmInfo"
              :key="info.film_id"
              class="[&:not(:first-child)]:mt-4"
            >
              <h4 v-if="filmInfo.length > 1" class="mb-2 font-bold">
                {{ info.title }}
              </h4>
              <dl v-if="info?.credits">
                <masonry-wall
                  :items="info.credits"
                  :column-width="224"
                  :gap="16"
                >
                  <template #default="{ item }">
                    <dt>{{ item.index }}</dt>
                    <dd class="mt-2" v-html="item.text" />
                  </template>
                </masonry-wall>
              </dl>
            </div>
          </HeadlessTabPanel>
        </HeadlessTabPanels>
      </HeadlessTabGroup>
      <ButtonLink to="/contact/" class="mt-16">お問い合わせ</ButtonLink>
    </div>
    <Modal :open="isModalOpen" @close="isModalOpen = false">
      <div class="w-56 flex justify-center flex-col">
        <Button :disabled="false" type="shop" @click="moveToBasket()"
          >カートを見る</Button
        >
        <Button
          :disabled="false"
          type="shop-secondary"
          class="mt-2"
          @click="isModalOpen = false"
          >買い物を続ける</Button
        >
      </div>
    </Modal>
  </NuxtLayout>
</template>
