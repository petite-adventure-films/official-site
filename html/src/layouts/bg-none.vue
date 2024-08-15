<script setup lang="ts">
const route = useRoute();
const config = useRuntimeConfig();

const title = `${route.meta.title} - ${config.public.SITE_NAME}`;
useServerSeoMeta({
  title,
  ogTitle: title,
});
useSeoMeta({
  title,
  ogTitle: title,
});
</script>

<template>
  <div class="wrapper">
    <AppHeader />
    <AppNav />
    <main>
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
