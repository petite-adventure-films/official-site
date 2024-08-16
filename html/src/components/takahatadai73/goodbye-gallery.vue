<script setup lang="ts">
import { goodbyeGallery } from '~/constants/takahatadai73';

const currentYear = ref(2013);
const currentMonth = ref(11);
const currentDay = ref(13);

const currentGallery = computed(
  () => goodbyeGallery[currentYear.value][currentMonth.value],
);
const currentGalleryNumber = computed(
  () => goodbyeGallery[currentYear.value][currentMonth.value][currentDay.value],
);

const setCurrentGallery = (year: number, month?: number) => {
  const _year = year;
  const _month = month
    ? month
    : Number(Object.keys(goodbyeGallery[year]).shift());
  const _day = Number(Object.keys(goodbyeGallery[year][_month]).shift());
  currentYear.value = _year;
  currentMonth.value = _month;
  currentDay.value = _day;
};

const getImgSrc = (number: number) => {
  const paddedMonth = currentMonth.value.toString().padStart(2, '0');
  const paddedDay = currentDay.value.toString().padStart(2, '0');
  const imgSrc = `goodbye_${currentYear.value}${paddedMonth}${paddedDay}_${number.toString()}.jpg`;
  return useAsset(`takahatadai73/${imgSrc}`);
};
</script>

<template>
  <section class="mt-48">
    <h3
      class="bg-tkhd73-yellow w-fit mx-auto p-2 -skew-y-3 text-xl sm:text-xl text-tkhd73-green"
    >
      ドキュメント･73号棟解体
    </h3>
    <p class="mt-8">
      裁判が和解で終了した後、住民たちは転居を余儀なくされ、やがて建物の解体作業が始まりました。元73号棟住民のM.Kさんが、取り壊し直前～解体までの様子を克明に記録し提供してくださいましたので、ここにご紹介します。
    </p>
    <p class="mt-2">カレンダーの月を選択して、写真を見てください。</p>
    <p class="mt-2 text-xs">撮影・提供：元73号棟住民 M.Kさん</p>

    <HeadlessTabGroup>
      <HeadlessTabList
        class="flex mt-4 border-white border-t border-l border-r [&_button]:border-white [&_button:not(:first-of-type)]:border-l"
      >
        <HeadlessTab
          v-for="(_, year) in goodbyeGallery"
          :key="`tab${year}`"
          v-slot="{ selected }"
          class="w-1/3"
          as="template"
          @click="setCurrentGallery(year)"
        >
          <button
            class="rounded-none focus:outline-none py-2 bg-opacity-25 sm:hover:text-black"
            :class="[
              selected ? 'bg-white' : 'text-gray-500 bg-tkhd73-green-shadow',
            ]"
          >
            {{ year }}
          </button>
        </HeadlessTab>
      </HeadlessTabList>
      <HeadlessTabPanels>
        <HeadlessTabPanel
          v-for="(months, year) in goodbyeGallery"
          :key="`tabPanel${year}`"
        >
          <ul
            class="flex flex-wrap border border-white [&_li]:border-white [&_li:nth-of-type(n+7)]:border-t [&_li:not(:nth-of-type(6n+1))]:border-l"
          >
            <li
              v-for="month in [...Array(12)].map((_, i) => i + 1)"
              :key="`month${month}`"
              class="group w-1/6 h-12"
              :class="[
                currentMonth === month ? 'selected' : '',
                Object.prototype.hasOwnProperty.call(months, month)
                  ? ''
                  : 'inactivated',
              ]"
            >
              <button
                :disabled="!Object.prototype.hasOwnProperty.call(months, month)"
                class="display w-full h-full flex justify-center items-center leading-none"
                :class="[
                  'group-[.selected]:bg-white group-[.selected]:bg-opacity-25',
                  'group-[.inactivated]:text-gray-500 group-[.inactivated]:bg-tkhd73-green-shadow  group-[.inactivated]:bg-opacity-25',
                ]"
                @click="setCurrentGallery(year, month)"
              >
                <span class="flex items-center flex-col">
                  {{ month }}<br />
                  <span
                    v-if="Object.prototype.hasOwnProperty.call(months, month)"
                    class="block"
                    >📷</span
                  >
                  <span v-else class="block w-f h-4" />
                </span>
              </button>
            </li>
          </ul>
        </HeadlessTabPanel>
      </HeadlessTabPanels>
    </HeadlessTabGroup>

    <div class="grid grid-cols-[repeat(31,1fr)] relative mt-4">
      <div class="absolute top-1/2 -translate-y-1/2 w-full h-px bg-white" />
      <div
        v-for="day in [...Array(31)].map((_, i) => i + 1)"
        :key="day"
        class="relative"
        :class="[currentDay === day ? 'flex-1' : 'w-[calc(100%/31)]']"
      >
        <button
          v-if="Object.prototype.hasOwnProperty.call(currentGallery, day)"
          class="block w-8 h-8 rounded-full border-2 border-white text-xs sm:hover:bg-white"
          :class="[
            Number(currentDay) === Number(day)
              ? 'bg-white'
              : 'bg-tkhd73-green-shadow',
          ]"
          @click="currentDay = day"
        >
          {{ day }}
        </button>
      </div>
    </div>

    <GalleryImage
      :slide-number="currentGalleryNumber"
      class="mt-4"
      img-border-color="white"
      bullet-color="white"
      bullet-color-active="tkhd73-green"
    >
      <template #gallery="{ currentIndex }">
        <div
          v-for="img in [...Array(currentGalleryNumber)].map((_, i) => i + 1)"
          :key="`img${img}`"
          :class="[
            currentIndex === img - 1
              ? 'opacity-100'
              : 'opacity-0 absolute pointer-events-none',
          ]"
        >
          <img :src="getImgSrc(img)" />
        </div>
      </template>
    </GalleryImage>
  </section>
</template>
