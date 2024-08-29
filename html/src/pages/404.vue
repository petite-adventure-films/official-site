<script setup>
definePageMeta({
  layout: false,
});

const route = useRoute();

route.meta.title = '404 Not Found';
</script>

<template>
  <NuxtLayout name="post">
    <template #h2>ページが見つかりません </template>
    <p>
      URLに間違いがないかもう一度ご確認ください。<br />もしくはページが一時的にアクセスができない状況にあるか、移動もしくは削除された可能性があります。
    </p>
    <NuxtLink to="/?op=skip" class="inline-block mt-4 link-text"
      >HOMEへ戻る</NuxtLink
    >
  </NuxtLayout>
</template>
