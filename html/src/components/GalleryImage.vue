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

defineExpose({
  setCurrentIndex,
});

const arrowColor = 'text-white';
const imgBorderColor = computed(() => `border-${props.imgBorderColor}`);
const arrowBgColor = computed(() => `bg-${props.imgBorderColor}`);
const bulletColor = computed(() => `bg-${props.bulletColor}`);
const bulletActiveColor = computed(() => `bg-${props.bulletColorActive}`);

// スワイプ
const minimumDistance = 30;
const startX = ref(0);
const startY = ref(0);
const endX = ref(0);
const endY = ref(0);
const touchstart = (e: TouchEvent) => {
  startX.value = e.touches[0].pageX;
  startY.value = e.touches[0].pageY;
};
const touchmove = (e: TouchEvent) => {
  endX.value = e.changedTouches[0].pageX;
  endY.value = e.changedTouches[0].pageY;
};
const touchend = () => {
  const distanceX = Math.abs(endX.value - startX.value);
  const distanceY = Math.abs(endY.value - startY.value);
  if (distanceX > distanceY && distanceX > minimumDistance) {
    if (endX.value - startX.value > 0) {
      ctrlGallery(-1);
    } else {
      ctrlGallery(1);
    }
  }
};
</script>

<template>
  <div>
    <div
      class="relative [&_[data-selected=false]]:opacity-0 [&_[data-selected=false]]:absolute [&_[data-selected=false]]:pointer-events-none [&_[data-selected=true]]:opacity-100 [&_[data-selected=true]]:relative border"
      :class="[imgBorderColor]"
      @touchstart="touchstart"
      @touchmove="touchmove"
      @touchend="touchend"
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
    <div
      v-if="slideNumber > 1"
      class="flex flex-wrap gap-2 justify-center mt-4"
    >
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
