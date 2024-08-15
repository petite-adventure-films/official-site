<script setup lang="ts">
import { DocumentArrowDownIcon, PlayCircleIcon } from '@heroicons/vue/24/solid';
import { takahatadai73Timeline } from '~/constants/takahatadai73';

const isPC = useMediaQuery('(min-width: 768px)');

const categories = {
  1: '高幡台団地73号棟取り壊しが決まるまで',
  2: '73号棟取り壊し公表後の動き',
  3: '裁判が始まってから',
};

const status = ref({});
for (const [category, years] of Object.entries(takahatadai73Timeline)) {
  status.value[category] = {};
  for (const [year, months] of Object.entries(years)) {
    status.value[category][year] = {};
    for (const [month, data] of Object.entries(months)) {
      status.value[category][year][month] = data.display_default;
    }
  }
}

const isShowwAllTimeline = ref(false);
const showAllTimeline = () => {
  isShowwAllTimeline.value = !isShowwAllTimeline.value;
  for (const [category, years] of Object.entries(takahatadai73Timeline)) {
    for (const [year, months] of Object.entries(years)) {
      for (const [month] of Object.entries(months)) {
        status.value[category][year][month] = isShowwAllTimeline.value;
      }
    }
  }
};

const thisPartyHasEvents = (party, data) => {
  return data.events.some((event) => party in event && event[party]);
};

const isEventDisplayed = (category, year, month) => {
  status.value[category][year][month] = !status.value[category][year][month];
};
</script>

<template>
  <section class="mt-48">
    <h3
      class="bg-tkhd73-yellow w-fit mx-auto p-2 -skew-y-3 text-xl sm:text-xl text-tkhd73-green"
    >
      UR vs 住民の会、その記録
    </h3>
    <p class="text-xs mt-4 text-center">※2020年10月現在</p>

    <div class="relative mt-8 border-t border-black">
      <div
        class="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-gray-100"
      />
      <div
        class="sticky top-12 py-8 z-10 h-12 flex justify-evenly items-center"
      >
        <span v-if="isPC" class="w-1/2 text-center">UR</span>
        <div
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <button
            class="block w-14 h-14 mx-auto rounded-full text-xs text-tkhd73-green border-2 border-white leading-none"
            :class="isShowwAllTimeline ? 'bg-white' : 'bg-tkhd73-green-shadow'"
            @click="showAllTimeline()"
          >
            詳細を<br />全部<br />{{ isShowwAllTimeline ? '閉じる' : '開く' }}
          </button>
        </div>
        <span v-if="isPC" class="w-1/2 text-center">住民の会</span>
      </div>
      <ul class="relative">
        <li
          v-for="(timeline, category) in takahatadai73Timeline"
          :key="`tkhd73Timeline${category}`"
          class="mt-8"
        >
          <h4 class="block bg-white bg-opacity-75 p-2 text-center">
            {{ categories[category] }}
          </h4>
          <ol>
            <li
              v-for="(months, year) in timeline"
              :key="`tkhd73Timeline${year}`"
            >
              <div
                class="flex justify-center items-center w-10 h-10 mt-4 bg-tkhd73-green border-2 border-white mx-auto rounded-full text-white text-xs"
              >
                {{ year }}
              </div>
              <ol>
                <li
                  v-for="(data, month) in months"
                  :key="`tkhd73Timeline${month}`"
                  class="mt-4"
                >
                  <div
                    class="flex justify-center items-center w-8 h-8 border-2 border-white mx-auto rounded-full text-tkhd73-green text-xs"
                    :class="[
                      status[category][year][month]
                        ? 'bg-white'
                        : 'bg-tkhd73-green-shadow',
                    ]"
                  >
                    <button
                      class="relative block w-full h-full"
                      @click="isEventDisplayed(category, year, month)"
                    >
                      {{ month }}
                      <span
                        v-if="thisPartyHasEvents('ur', data)"
                        class="absolute -left-3 block w-2 h-3 top-1/2 -translate-y-1/2 [clip-path:polygon(0%_50%,100%_0%,100%_100%)] bg-tkhd73-green"
                        :class="[
                          status[category][year][month]
                            ? 'bg-white'
                            : 'bg-tkhd73-green',
                        ]"
                      />
                      <span
                        v-if="thisPartyHasEvents('residents', data)"
                        class="absolute -right-3 block w-2 h-3 top-1/2 -translate-y-1/2 [clip-path:polygon(0%_0%,100%_50%,0%_100%)] bg-tkhd73-green"
                        :class="[
                          status[category][year][month]
                            ? 'bg-white'
                            : 'bg-tkhd73-green',
                        ]"
                      />
                    </button>
                  </div>
                  <ol v-if="status[category][year][month]">
                    <li
                      v-for="(event, key) in data.events"
                      :key="`tkhd73Timeline${month}Event${key}`"
                      class="sm:w-1/2 mt-2"
                      :class="[event.ur ? 'sm:pr-8' : 'ml-auto sm:pl-8']"
                    >
                      <span v-if="event.day" class="block">
                        {{ Number(event.day) ? `${event.day}日` : event.day
                        }}<br />
                      </span>
                      <p v-if="event.ur">
                        <span
                          v-if="!isPC"
                          class="inline-flex align-middle bg-tkhd73-ur text-white px-1 text-xs"
                          >UR</span
                        ><br v-if="!isPC" />
                        {{ event.ur }}
                      </p>
                      <p v-if="event.residents">
                        <span
                          v-if="!isPC"
                          class="inline-flex align-middle bg-tkhd73-yellow px-1 text-xs"
                          >住民の会</span
                        ><br v-if="!isPC" />
                        {{ event.residents }}
                      </p>
                      <ul v-if="event.materials">
                        <li
                          v-for="(material, mkey) in event.materials"
                          :key="`material${mkey}`"
                          class="text-xs"
                        >
                          <a
                            v-if="material.type === 'document'"
                            :href="`/assets/documents/takahatadai73/${material.name}`"
                            :download="material.name"
                            target="_blank"
                            class="flex items-center link-text"
                            >{{ material.name }}
                            <DocumentArrowDownIcon class="w-4 h-4"
                          /></a>
                          <NuxtLink
                            v-else-if="material.type === 'youtube'"
                            :to="material.url"
                            target="_blank"
                            class="flex items-center link-text"
                            >{{ material.name }}<PlayCircleIcon class="w-4 h-4"
                          /></NuxtLink>
                        </li>
                      </ul>
                    </li>
                  </ol>
                </li>
              </ol>
            </li>
          </ol>
        </li>
      </ul>
    </div>
  </section>
</template>
