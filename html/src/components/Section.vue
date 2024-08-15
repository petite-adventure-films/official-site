<script setup lang="ts">
const route = useRoute();
const props = withDefaults(
  defineProps<{
    title: string;
    marginTop?: string;
    viewMoreTo?: string;
  }>(),
  {
    title: '',
    marginTop: 'mt-16',
    viewMoreTo: '',
  },
);
</script>

<template>
  <section :class="marginTop">
    <div class="flex flex-wrap items-center gap-2">
      <H3 :class="route.name === 'index' ? '' : ''">{{ props.title }}</H3>
      <NuxtLink v-if="props.viewMoreTo" :to="props.viewMoreTo">
        <ReadMore text="VIEW MORE" />
      </NuxtLink>
    </div>
    <div class="mt-4">
      <slot />
    </div>
  </section>
</template>
