<script setup>
const error = useError();
</script>

<template>
  <NuxtLayout v-if="error.statusCode === 404" name="post">
    <template #h2>お探しのページが見つかりません</template>
    <p>
      URLに間違いがないかもう一度ご確認ください。<br />
      もしくはページが一時的にアクセスができない状況にあるか、
      移動もしくは削除された可能性があります。
    </p>
  </NuxtLayout>
  <NuxtLayout v-else name="post">
    <template #h2>エラーが発生しました</template>
    <p>しばらくしてからもう一度お試しください。</p>
  </NuxtLayout>
</template>
