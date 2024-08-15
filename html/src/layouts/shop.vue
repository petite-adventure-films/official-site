<script setup lang="ts">
const slots = useSlots();
const route = useRoute();
const config = useRuntimeConfig();
const { updateBasket } = useBasketState();

const title = `${route.meta.title} - SHOP - ${config.public.SITE_NAME}`;
useServerSeoMeta({
  title,
  ogTitle: title,
});
useSeoMeta({
  title,
  ogTitle: title,
});

onMounted(() => {
  if (sessionStorage.getItem('basket')) {
    updateBasket(JSON.parse(sessionStorage.getItem('basket')));
  }
});
</script>

<template>
  <div class="wrapper">
    <ShopAppHeader />
    <ShopAppNav />
    <main class="mt-16">
      <header>
        <slot name="breadcrumb" />
        <slot name="headerTags" />
        <h2 class="text-2xl"><slot name="h2" /></h2>
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
