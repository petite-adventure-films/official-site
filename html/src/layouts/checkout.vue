<script setup lang="ts">
const config = useRuntimeConfig();

const title = `SHOP - ${config.public.SITE_NAME}`;
useServerSeoMeta({
  title,
  ogTitle: title,
  robots: 'noindex, nofollow',
});
useSeoMeta({
  title,
  ogTitle: title,
});
</script>

<template>
  <div class="wrapper">
    <header>
      <ShopAppName />
    </header>
    <main class="mt-8">
      <header>
        <h2 class="text-2xl"><slot name="h2" /></h2>
      </header>
      <div class="mt-8">
        <slot />
      </div>
    </main>
    <AppFooter />
  </div>
</template>
