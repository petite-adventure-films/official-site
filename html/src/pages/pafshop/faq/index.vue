<script setup lang="ts">
definePageMeta({
  layout: false,
});

const config = useRuntimeConfig();
const route = useRoute();

route.meta.title = 'よくある質問';
useSeoMeta({
  ogUrl: `${config.public.SITE_URL}pafshop/faq/`,
});

const list = [
  {
    index: '商品はどのくらいで届きますか？',
    text: 'お支払い確認後、3～5日以内に発送します。',
  },
  {
    index: 'どのような支払方法がありますか？',
    text: 'クレジットカード（Visa、Master）、銀行振込（三菱UFJ銀行、ゆうちょ銀行、PayPay銀行）からお選びいただけます。',
  },
  {
    index: '送料はいくらですか？',
    text: '1回のお申込につき、同一住所宛なら何枚でも300円です。3,000円以上のお買い上げで送料無料となります。',
  },
  {
    index: '後払いはできますか？',
    text: '「先払い」でお願いしていますが、図書館や学校法人などは、請求書による後払いも可能です。その場合はご相談ください。',
  },
  {
    index: '「団体・ライブラリー価格」とは何ですか？',
    text: '学校・団体や図書館など、不特定多数の方への無料貸出を目的としたご購入の場合は、「団体・ライブラリー価格」でお買い求め下さい。有料貸出の場合は、別途ご相談下さい。',
  },
  {
    index: '購入したDVDで、上映会を開催することはできますか？',
    text: 'DVD・ブルーレイには上映権はついていません。上映をご希望の場合は、<a href="/four-walling/" class="link-text">自主上映について</a>をご覧ください。',
  },
  {
    index: 'ディスクの規格は？',
    text: 'DVDの規格は、NTSC、DVD-Rディスク（DVD-R対応機器にて再生可能）です。ブルーレイの規格は、NTSC、BD-Rディスク（BD-R対応機器にて再生可能）です。',
  },
  {
    index: 'ディスクが再生されません。',
    text: 'DVD及びブルーレイディスクは、再生機器との相性により、まれにディスクが読み込まれなかったり、メニュー画面が表示されなかったり、再生が途中で止まってしまうことがあります。その場合は、他機器での再生をお試しください。それでも再生されない場合は、ご連絡を頂ければ、パソコン再生専用のディスクと交換いたします。',
  },
  {
    index: '返品はできますか？',
    text: '商品に不具合があった場合にのみ、交換の対応をさせていただいております。お客様都合での返品・交換は承れません。あらかじめご了承ください。',
  },
];
</script>
<template>
  <NuxtLayout name="shop">
    <template #h2>よくある質問</template>
    <dl class="flex flex-col gap-y-8">
      <div
        v-for="detail in list"
        :key="`${detail}-${detail.index}`"
        class="flex flex-wrap gap-x-1"
      >
        <dt class="flex gap-x-1 items-start before:content-['Q.']">
          <span>{{ detail.index }}</span>
        </dt>
        <dd class="flex gap-x-1 before:content-['A.']">
          <span v-html="detail.text" />
        </dd>
      </div>
    </dl>
    <p class="mt-16">
      その他の質問などがありましたら、下記からお問い合わせください。
    </p>
    <ButtonLink to="/contact/" class="mt-4">お問い合わせ</ButtonLink>
  </NuxtLayout>
</template>
