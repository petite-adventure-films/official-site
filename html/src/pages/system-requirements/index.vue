<script setup lang="ts">
definePageMeta({
  layout: false,
});

const config = useRuntimeConfig();
const route = useRoute();

route.meta.title = '推奨環境';
useSeoMeta({
  ogUrl: `${config.public.SITE_URL}system-requirements/`,
});

const list = [
  {
    index: 'Microsoft Windowsをお使いの場合',
    text: 'Microsoft Edge, Mozilla Firefox, Google chrome 最新版',
  },
  {
    index: 'Apple Macintoshをお使いの場合',
    text: 'Safari, Mozilla Firefox, Google chrome 最新版',
  },
  {
    index: 'iOSをお使いの場合',
    text: 'iOS 最新版 / Safari, Google chrome 最新版',
  },
  {
    index: 'androidOSをお使いの場合',
    text: 'Android 最新版 / Google chrome 最新版',
  },
];
</script>

<template>
  <NuxtLayout name="post">
    <template #breadcrumb>
      <BreadCrumb />
    </template>
    <template #h2>推奨環境</template>
    <H3>OS・ブラウザー推奨環境</H3>
    <DefinitionList class="mt-2" :list="list" />
    <p class="mt-2">
      上記の推奨環境以外のブラウザー環境の場合、一部コンテンツのレイアウト・動作等が正常に反映されない場合がございます。お手数ですがブラウザーのバージョン等をご確認ください。
    </p>
    <p class="mt-2">
      最新のブラウザーは下記からダウンロードしてご利用にしてください。
    </p>
    <p class="mt-2">
      Chrome<br />
      <ExternalLink href="http://www.google.com/chrome"
        >www.google.com/chrome</ExternalLink
      >
    </p>
    <p class="mt-2">
      Firefox<br />
      <ExternalLink href="http://www.mozilla.com">www.mozilla.com</ExternalLink>
    </p>
    <p class="mt-2">
      Safari<br />
      <ExternalLink href="http://www.apple.com/safari/download"
        >www.apple.com/safari/download</ExternalLink
      >
    </p>
    <H3 class="mt-8">JavaScriptについて</H3>
    <p class="mt-2">
      当サイトでは機能性向上を目的として一部JavaScriptを使用しており、JavaScriptを有効にしていただくことを推奨しております。
    </p>
  </NuxtLayout>
</template>
