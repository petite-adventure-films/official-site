<script setup lang="ts">
const route = useRoute();
</script>

<template>
  <NuxtLink
    to="/?op=skip"
    :class="['hover:text-gray-500', route.name === 'index' ? '' : '']"
  >
    <h1 class="text-center">
      <span class="block text-2xl font-siteName">Petite Adventure Films</span>
      <span class="block leading-none">プチ・アドベンチャー・フィルムズ</span>
    </h1>
  </NuxtLink>
</template>
