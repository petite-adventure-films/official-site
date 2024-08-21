<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    youtubeId: string;
  }>(),
  {
    youtubeId: '',
  },
);
</script>

<template>
  <div class="aspect-video">
    <iframe
      width="560"
      height="315"
      :src="`https://www.youtube-nocookie.com/embed/${props.youtubeId}`"
      title="YouTube video player"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
      class="w-full h-full"
    />
  </div>
</template>
