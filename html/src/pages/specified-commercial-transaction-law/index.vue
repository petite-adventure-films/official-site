<script setup lang="ts">
definePageMeta({
  layout: false,
});

const config = useRuntimeConfig();
const route = useRoute();

route.meta.title = '特定商取引法に基づく表記';
useSeoMeta({
  ogUrl: `${config.public.SITE_URL}specified-commercial-transaction-law/`,
});

const list = [
  { index: '販売者名', text: '早川由美子' },
  { index: '住所', text: '〒191-0052 東京都日野市東豊田3-3-6-202' },
  { index: '電話番号', text: '080-4146-3404' },
  { index: '販売価格', text: '商品ごとに設定' },
  { index: '支払方法', text: 'クレジットカード、コンビニ決済、銀行振込' },
  { index: '商品代金以外の必要金額', text: '振込手数料、送料' },
  {
    index: '引渡時期',
    text: '代金決済完了後、翌日～3日以内に発送いたします。（当方の出張等で3日以上かかる場合は、予めご連絡いたします）',
  },
  {
    index: '返品について',
    text: '商品には万全を期しておりますが、万一、商品に欠陥がある場合は、直ちに交換いたします。商品到着後7営業日以内に「商品到着日」、「注文者名」、「住所」、「E-mail」、「電話番号」、「返品理由」を記載の上、メールでお知らせ下さい。なお、お客様都合による返品・交換はご容赦ください。',
  },
];
</script>

<template>
  <NuxtLayout name="post">
    <template #breadcrumb>
      <BreadCrumb />
    </template>
    <template #h2>特定商取引法に基づく表記</template>
    <DefinitionList class="mt-2" :list="list" />
    <ButtonLink to="/contact/" class="mt-16">お問い合わせ</ButtonLink>
  </NuxtLayout>
</template>
