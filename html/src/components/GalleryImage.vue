<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    slideNumber: number;
    speed?: number;
    imgBorderColor?: string;
    bulletColor?: string;
    bulletColorActive?: string;
  }>(),
  {
    slideNumber: 0,
    speed: 5000,
    imgBorderColor: 'black',
    bulletColor: 'gray-100',
    bulletColorActive: 'black',
  },
);

const currentIndex = ref(0);

const ctrlGallery = (num: number) => {
  currentIndex.value += num;
  if (currentIndex.value < 0) {
    currentIndex.value = props.slideNumber - 1;
  } else if (currentIndex.value > props.slideNumber - 1) {
    currentIndex.value = 0;
  }
};

const setCurrentIndex = (num: number) => {
  currentIndex.value = num;
};

const arrowColor = 'text-white';
const imgBorderColor = computed(() => `border-${props.imgBorderColor}`);
const arrowBgColor = computed(() => `bg-${props.imgBorderColor}`);
const bulletColor = computed(() => `bg-${props.bulletColor}`);
const bulletActiveColor = computed(() => `bg-${props.bulletColorActive}`);
</script>

<template>
  <div class="relative">
    <div
      class="relative [&_[data-selected=false]]:opacity-0 [&_[data-selected=false]]:absolute [&_[data-selected=false]]:pointer-events-none [&_[data-selected=true]]:opacity-100 [&_[data-selected=true]]:relative border"
      :class="[imgBorderColor]"
    >
      <slot name="gallery" v-bind="{ currentIndex }" />

      <button
        v-if="slideNumber > 1"
        class="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r sm:hover:from-purple-100/25"
        @click="ctrlGallery(-1)"
      >
        <div
          class="flex justify-center items-center w-8 h-8 mr-auto bg-opacity-25"
          :class="[arrowColor, arrowBgColor]"
        >
          ←
        </div>
      </button>
      <button
        v-if="slideNumber > 1"
        class="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l sm:hover:from-purple-100/25"
        @click="ctrlGallery(1)"
      >
        <div
          class="flex justify-center items-center w-8 h-8 ml-auto bg-opacity-25"
          :class="[arrowColor, arrowBgColor]"
        >
          →
        </div>
      </button>
    </div>
    <div v-if="slideNumber > 1" class="flex gap-2 justify-center mt-4">
      <button
        v-for="num in [...Array(props.slideNumber).keys()]"
        :key="`bullet-${num}`"
        :class="[
          currentIndex === num && bulletActiveColor,
          currentIndex !== num && bulletColor,
          'w-2 h-2',
        ]"
        @click="setCurrentIndex(num)"
      />
    </div>
  </div>
</template>
