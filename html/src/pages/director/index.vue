<script setup lang="ts">
import { FILMS } from '~/constants/film_info';

definePageMeta({
  title: '監督について',
  layout: false,
});

const tilmline: { [key: string]: { title: string; film_id: string }[] } = {};
for (const film of FILMS) {
  if (!tilmline[film.created_at]) {
    tilmline[film.created_at] = [];
  }
  tilmline[film.created_at].push({
    title: film.title,
    film_id: film.film_id,
  });
}
</script>

<template>
  <NuxtLayout name="post">
    <template #breadcrumb>
      <BreadCrumb />
    </template>
    <template #h2>監督プロフィール</template>
    <template #lead>
      <p class="text-xl sm:text-xl">
        早川由美子（はやかわゆみこ）<br />
        ドキュメンタリー監督
      </p>
      <img
        src="~/assets/images/director/profile.jpg"
        alt="早川由美子"
        class="mt-4"
      />
      <p class="mt-4">
        1975年東京都出身。成蹊大学法学部、London School of
        Journalism卒業。公務員、会社員を経て、ジャーナリストを志し2007年に渡英。ロンドンでジャーナリズムを学ぶ傍ら、独学で映像制作を始める。イギリス国会前の平和活動家、ブライアン･ホウを追った初監督作『ブライアンと仲間たち
        パーラメント･スクエアSW1』(2009年)で、日本ジャーナリスト会議･黒田清JCJ新人賞を受賞。
      </p>
      <p class="mt-2">
        2009年に帰国し、以降は東京を拠点に活動。日本の公共住宅問題を取り上げた2作目『さようならUR』(2011年)で、山形国際ドキュメンタリー映画祭･スカパー!IDEHA賞を受賞。その他の作品に、『木田さんと原発、そして日本』(2013年)、『インド日記～ガジュマルの木の女たち～』(2016年)、『日々新～早春の日向新しき村～』（2020年）など。
      </p>
      <p class="mt-2">
        自身の作品制作の他、市民による情報発信力を高めるため、スマホやビデオカメラによる撮影や編集のワークショップも積極的に行う。2021年、第4回プロ市民人権賞を受賞。
      </p>
    </template>

    <Section title="Filmography" margin-top="mt-8">
      <ul class="flex flex-col gap-4 border-l border-black p-4">
        <li
          v-for="year in Object.entries(tilmline).reverse()"
          :key="`film-${year[0]}`"
          class="relative"
        >
          <span class="absolute block w-2 h-2 bg-black rounded top-0 -left-5" />
          <h4>{{ year[0] }}年</h4>
          <ul class="ml-2">
            <li v-for="film in year[1]" :key="`film-${film.film_id}`">
              <NuxtLink :to="`/films/${film.film_id}/`" class="link-text">{{
                film.title
              }}</NuxtLink>
            </li>
          </ul>
        </li>
      </ul>
    </Section>
  </NuxtLayout>
</template>
