<script setup lang="ts">
const slots = useSlots();
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
  <div class="wrapper bg-white">
    <AppHeader />
    <AppNav />
    <main class="mt-16">
      <header>
        <slot name="breadcrumb" />
        <slot name="headerTags" />
        <h2 class="text-xl font-bold"><slot name="h2" /></h2>
      </header>
      <div v-if="!!slots.lead" class="mt-8">
        <slot name="lead" />
      </div>
      <div class="mt-8">
        <slot />
      </div>
      <footer v-if="!!slots.footer">
        <slot name="footer" />
      </footer>
    </main>
    <aside v-if="!!slots.aside" class="mt-16">
      <slot name="aside" />
    </aside>
    <AppFooter />
  </div>
</template>
