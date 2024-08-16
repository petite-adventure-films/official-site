<script setup lang="ts">
import SITE_NAV from '~/constants/nav.json';
const route = useRoute();
const pageName = route.name as string;

const isIncludedPage = (key: string) =>
  pageName.includes(key) ||
  (key === 'blog' && pageName.includes('category')) ||
  (key === 'blog' && pageName.includes('pageName'));
</script>

<template>
  <div class="sticky -top-[1px] my-8 z-50 flex gap-2 justify-center">
    <HeadlessMenu v-slot="{ open }">
      <HeadlessMenuButton
        :class="[
          'relative z-10 flex flex-col w-12 h-12 justify-center items-center',
          open
            ? ''
            : 'bg-black text-white sm:hover:bg-white sm:hover:border sm:hover:border-black sm:hover:text-black',
        ]"
        ><span class="text-xs">MENU</span>
      </HeadlessMenuButton>
      <HeadlessMenuItems
        as="nav"
        class="absolute left-1/2 w-48 -translate-x-1/2 sm:w-auto bg-white border border-black pt-12 px-2 pb-2 text-xs"
      >
        <HeadlessMenuItem
          v-for="(name, key) in SITE_NAV"
          :key="`site-nav-${key}`"
        >
          <NuxtLink
            :to="`/${key === 'index' ? '?op=skip' : `${key}`}`"
            :class="[
              'block text-center py-2 px-4 border-t border-black palt sm:hover:bg-gray-100 sm:hover:text-black',
              isIncludedPage(key) ? 'bg-gray-100' : '',
            ]"
          >
            {{ name }}
          </NuxtLink>
        </HeadlessMenuItem>
      </HeadlessMenuItems>
    </HeadlessMenu>
  </div>
</template>
