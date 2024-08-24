<script setup>
definePageMeta({
  layout: false,
});
const error = useError();
</script>

<template>
  <NuxtLayout name="post">
    <template #h2>
      {{
        error.statusCode === 404
          ? 'ページが見つかりません'
          : 'エラーが発生しました'
      }}
    </template>
    <div v-if="error.statusCode === 404">
      <p>
        URLに間違いがないかもう一度ご確認ください。<br />もしくはページが一時的にアクセスができない状況にあるか、移動もしくは削除された可能性があります。
      </p>
    </div>
    <div v-else>
      <p>しばらくしてからもう一度お試しください。</p>
    </div>
    <NuxtLink to="/?op=skip" class="inline-block mt-4 link-text"
      >HOMEへ戻る</NuxtLink
    >
  </NuxtLayout>
</template>
