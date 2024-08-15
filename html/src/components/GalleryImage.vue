<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    slideNumber: number;
    speed?: number;
    borderColor?: string;
  }>(),
  {
    slideNumber: 0,
    speed: 5000,
    borderColor: 'black',
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
</script>

<template>
  <div class="relative">
    <div
      class="relative [&_[data-selected=false]]:opacity-0 [&_[data-selected=false]]:absolute [&_[data-selected=false]]:pointer-events-none [&_[data-selected=true]]:opacity-100 [&_[data-selected=true]]:relative [&_img]:border [&_img]:border-black"
    >
      <slot name="gallery" v-bind="{ currentIndex }" />

      <button
        class="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r sm:hover:from-purple-100/25"
        @click="ctrlGallery(-1)"
      >
        <div
          class="flex justify-center items-center absolute top-1/2 w-6 h-6 -translate-y-1/2 text-white"
        />
      </button>
      <button
        class="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l sm:hover:from-purple-100/25"
        @click="ctrlGallery(1)"
      >
        <div
          class="flex justify-center items-center absolute top-1/2 right-0 w-6 h-6 -translate-y-1/2 text-white"
        />
      </button>
    </div>
    <div class="flex gap-2 justify-center mt-4">
      <button
        v-for="num in [...Array(props.slideNumber).keys()]"
        :key="`bullet-${num}`"
        :class="{
          'bg-black': currentIndex === num,
          'bg-gray-100': currentIndex !== num,
          'w-2 h-2': true,
        }"
        @click="setCurrentIndex(num)"
      />
    </div>
  </div>
</template>
