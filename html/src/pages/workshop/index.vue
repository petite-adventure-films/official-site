<script setup lang="ts">
import META from '~/constants/meta.json';
import type { Blog } from '~/types/blog';

definePageMeta({
  layout: false,
});

const config = useRuntimeConfig();
const route = useRoute();

route.meta.title = '映像制作を学びませんか？';
useSeoMeta({
  description: META.workshop,
  ogDescription: META.workshop,
  ogUrl: `${config.public.SITE_URL}workshop/`,
});

const { posts } = await useWpGetList<Blog>('blog', {
  query: {
    tag: '映像ワークショップ',
    per_page: 5,
  },
});
</script>

<template>
  <NuxtLayout name="post">
    <template #breadcrumb>
      <BreadCrumb />
    </template>
    <template #h2>映像制作を学びませんか？</template>
    <template #lead>
      <p>
        ビデオカメラが小型化し、値段も手ごろとなり、スマホでも簡単に動画が撮影できる時代になりました。それに伴い、「映像制作に興味がある」、「自分たちの活動を映像で紹介したい」、「スマホで撮った映像を編集したい」、「オンライン配信をしたい」等々、映像制作を学びたい方が増えています。
      </p>
      <p class="mt-2">
        プチ・アドベンチャー・フィルムズでは、初心者～中級者を対象に、ニーズに合わせた映像ワークショップを承っております。ご興味のある方は、<NuxtLink
          to="/contact/"
          class="link-text"
          >お問い合わせ</NuxtLink
        >よりご連絡ください。
      </p>
      <GalleryImage class="mt-4" :slide-number="7">
        <template #gallery="{ currentIndex }">
          <div
            v-for="(image, key) in [
              useAsset('workshop/workshop_image_1.jpg'),
              useAsset('workshop/workshop_image_2.jpg'),
              useAsset('workshop/workshop_image_3.jpg'),
              useAsset('workshop/workshop_image_4.jpg'),
              useAsset('workshop/workshop_image_5.jpg'),
              useAsset('workshop/workshop_image_6.jpg'),
              useAsset('workshop/workshop_image_7.jpg'),
            ]"
            :key="`still-${image}`"
            class="pointer-events-none"
            :data-selected="currentIndex === key"
          >
            <img :src="image" />
          </div>
        </template>
      </GalleryImage>
      <ButtonLink to="/contact/" class="mt-4">お問い合わせ</ButtonLink>
    </template>
    <Section title="映像ワークショップで学べる内容（例）">
      <p>
        ワークショップで学ぶ内容は、受講者のレベルや目的、受講期間（講座の回数）等により、カスタマイズが可能です。ご相談ください。
      </p>
      <dl class="mt-4 [&_dd]:mt-2">
        <div>
          <dt>撮影</dt>
          <dd>
            カメラの使い方、三脚やマイクの使い方、「見せる」撮り方のコツ、企画・構成の考え方、取材・インタビュー、著作権・肖像権、撮影時のトラブル回避など、基礎から応用まで対応。
          </dd>
        </div>
        <div class="mt-4">
          <dt>編集</dt>
          <dd>
            編集ソフトの使い方、スライドショーの作成、動画の編集、ナレーション・テロップの作成、音楽の使用、「伝える」ための編集の工夫など、基礎から応用まで対応。
          </dd>
        </div>
        <div class="mt-4">
          <dt>公開</dt>
          <dd>
            YouTube等インターネットでの作品公開、映画祭への応募、自主上映開催など、完成作品を発表し広める方法を学ぶ。
          </dd>
        </div>
      </dl>
      <p class="mt-2 text-xs text-gray-500">
        ※撮影の基礎から作品の公開までをひと通り学び、講座修了時までに3分間の映像作品を制作するコースの例は、<ExternalLink
          href="https://civiltachikawa.sakura.ne.jp/shimin-koza-n49.html"
          >こちら</ExternalLink
        >をご覧ください。
      </p>
    </Section>
    <Section title="受講対象">
      <p>
        初級または中級の団体および個人<br />
        （これまでに、小学生～80代の方が受講されました♬）
      </p>
    </Section>
    <Section title="必要な機材（応相談）">
      <p>
        動画が撮影できる機器（ビデオカメラ、デジカメ、スマホ、タブレットなど）<br />
        ノートパソコン（WindowsまたはMac）
      </p>
      <p class="mt-2 text-xs text-gray-500">
        ※講座の内容により、必要な機材は変わります。<br />
        ※団体での受講の場合、プロジェクター、スクリーン、スピーカーなどが必要な場合があります。<br />
        ※講座で使用する機材は、1人1台ではなく、数人で1台のカメラとパソコンを共有する形でも可能です。
      </p>
    </Section>
    <Section title="ワークショップの費用">
      <p>
        講座の内容、開催場所、受講期間（講座の回数）、受講者数などによって変わります。詳細は<NuxtLink
          to="/contact"
          class="link-text"
          >お問い合わせ</NuxtLink
        >ください。
      </p>
    </Section>

    <Section title="これまでの主なワークショップ開催実績">
      <dl class="mt-2 flex flex-col gap-y-2">
        <div
          v-for="detail in [
            {
              index: '成蹊大学経営学部・社会理解実践講義「メディアと映像表現」',
              text: ['2025年～ / 学部生対象、前期&後期'],
            },
            {
              index: '市民の学習・活動・交流センター シビル',
              text: ['2015年&2017年&2020年&2023年 / 一般対象、全6～8回コース'],
            },
            {
              index: '川崎市麻生区岡上分館',
              text: [
                '2022年 / 一般対象、全5回コース、あさおドーガサークルと共同担当',
              ],
            },
            {
              index: '川崎市麻生市民館',
              text: ['2019年 / 一般対象、全3回コース'],
            },
            {
              index: '東京女子大学',
              text: ['2016年 / 大学生対象、全2回コース'],
            },
            {
              index: '環境まちづくりNPO エコメッセ',
              text: ['2015年 / 会員対象、1日コース'],
            },
            {
              index: 'あなたの公-差-転（Kosaten/Dislocate）',
              text: [
                '2013年 / 小学生親子対象、全2回コース、映画監督コーム･チャンラズマイさんと共同担当',
                '2017年 / 主に移住者や外国にルーツを持つ方々を対象、1日コース',
              ],
            },

            {
              index: '日本ジャーナリスト会議・ジャーナリスト養成講座',
              text: ['2012年 / 学生&一般対象、1日コース'],
            },
            {
              index: '市民メディアセンター MediR',
              text: [
                '2011年 / 一般対象、全6回コース、映画監督根来祐さんと共同担当',
              ],
            },
          ]"
          :key="`${detail}-${detail.index}`"
          class="flex flex-wrap gap-x-2 [&>dt]:after:content-[':']"
        >
          <dt class="flex gap-2">
            {{ detail.index }}
          </dt>
          <dd v-for="text in detail.text" :key="`${detail}-${text}`">
            {{ text }}
          </dd>
        </div>
      </dl>
    </Section>
    <Section
      title="最近の映像ワークショップレポート"
      view-more-to="/blog/tag/映像ワークショップレポート/"
    >
      <ArchiveList v-if="posts" class="mt-4 w-full">
        <li v-for="data in posts.data" :key="data.id">
          <PostCard
            :to="`/${data.name}/`"
            :title="data.title"
            :published="data.published"
            :film-tags="data.film_tags"
            :attached-info="data.categories.map((c) => c.name)"
          />
        </li>
      </ArchiveList>
    </Section>
    <ButtonLink to="/contact/" class="mt-16">お問い合わせ</ButtonLink>
  </NuxtLayout>
</template>
