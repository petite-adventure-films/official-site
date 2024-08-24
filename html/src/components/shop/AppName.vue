<script setup lang="ts">
const route = useRoute();
</script>

<template>
  <NuxtLink
    to="/pafshop/"
    :class="['hover:text-gray-500', route.name === 'index' ? 'text-white' : '']"
  >
    <h1 class="text-center">
      <span class="block text-2xl font-siteName"
        >Petite Adventure Films SHOP</span
      >
    </h1>
  </NuxtLink>
</template>
