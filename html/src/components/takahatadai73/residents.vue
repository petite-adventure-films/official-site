<script setup lang="ts">
import { DocumentArrowDownIcon } from '@heroicons/vue/24/solid';
import { residents } from '~/constants/takahatadai73';

const getImgSrc = (num) => {
  return new URL(
    `../../assets/images/takahatadai73/resident_${num}.png`,
    import.meta.url,
  ).href;
};
</script>

<template>
  <section class="mt-48">
    <h3
      class="bg-tkhd73-yellow w-fit mx-auto p-2 -skew-y-3 text-xl sm:text-xl text-tkhd73-green"
    >
      素敵な住民のご紹介
    </h3>
    <masonry-wall :items="residents" :column-width="224" :gap="16" class="mt-8">
      <template #default="{ item }">
        <div>
          <img :src="getImgSrc(item.key)" />
          <div
            class="bg-white bg-opacity-50 backdrop-filter backdrop-blur-sm border-t border-white p-4"
          >
            <div class="flex flex-wrap items-center gap-x-2">
              <p>{{ item.name }}</p>
              <a
                v-if="item.statement"
                :href="`/assets/documents/takahatadai73/statement_${item.key}.pdf`"
                :download="`statement_${item.key}.pdf`"
                target="_blank"
                class="flex items-center link-text text-xs"
                >陳述書<DocumentArrowDownIcon class="w-4 h-4"
              /></a>
            </div>
            <DefinitionList
              v-if="item.hobby || item.favouriteIndex || item.karaoke"
              :list="[
                { index: '趣味', text: item.hobby },
                {
                  index: `好きな${item.favouriteIndex}`,
                  text: item.favouriteContents,
                },
                { index: 'カラオケ18番', text: item.karaoke },
              ]"
              class="mt-2"
            />
            <p v-if="item.message" class="mt-2" v-html="item.message" />
            <p
              v-if="item.notice"
              class="mt-2 pt-2 border-t border-white"
              v-html="item.notice"
            />
          </div>
        </div>
      </template>
    </masonry-wall>
  </section>
</template>
