<script setup lang="ts">
definePageMeta({
  title: '自主上映について',
  layout: false,
});
</script>

<template>
  <NuxtLayout name="post">
    <template #breadcrumb>
      <BreadCrumb />
    </template>
    <template #h2>自主上映について</template>
    <template #lead>
      <p>
        自主上映会サポーター募集！<br />お住まいの地域、学校、グループで、映画を上映しませんか？
      </p>
      <GalleryImage class="mt-4" :slide-number="4">
        <template #gallery="{ currentIndex }">
          <div
            v-for="(image, key) in [
              useAsset('four-walling/four-walling_image_1.jpg'),
              useAsset('four-walling/four-walling_image_2.jpg'),
              useAsset('four-walling/four-walling_image_3.jpg'),
              useAsset('four-walling/four-walling_image_4.jpg'),
            ]"
            :key="`still-${image}`"
            class="pointer-events-none"
            :data-selected="currentIndex === key"
          >
            <img :src="image" />
          </div>
        </template>
      </GalleryImage>
      <p class="mt-4">
        自主上映会を開催してくださるサポーターの方を、大募集中です！<br />
        地域で、職場で、学校で、グループで…など、自主上映会開催に興味のある方は、以下「お問い合わせ」よりご連絡ください。
      </p>
      <ButtonLink to="/contact/" class="mt-4">お問い合わせ</ButtonLink>
    </template>
    <Section title="上映料（全作品共通）">
      <p>
        完全自主制作作品のため、制作支援として上映料のカンパをお願いしています。<br />
        1回の上映につき、入場者20名以下の場合、上映料は1万円となります。<br />
        20名を超える場合は、入場者数×500円です。<br />
        （例えば入場者40名の場合、上映料は2万円となります）<br />
        『インド日記』のオリジナルは206分ですが、上映用の100分バージョンもあります。
      </p>
      <p class="mt-2 text-xs text-gray-500">
        ※上映料についてご相談に応じます。<br />
        ※上映の条件は予告なく変更する場合があります。最新の上映条件は、常にこのウェブサイト上で公開しています。<br />
        ※講演などのご依頼も歓迎いたします。<br />
        ※入場料の設定は自由です。<br />
        ※商業的な上映や、映画館などでの上映については、別途ご連絡ください。<br />
      </p>
    </Section>
    <Section title="宣伝資材">
      <p>
        上映作品のスチール写真やテキストは、無償でご提供します。<br />
        『ブライアンと仲間たち』、『さようならUR』、『インド日記』は、チラシとポスターもご用意しています。
      </p>
      <h4 class="mt-4">映画のチラシ</h4>
      <p class="mt-2">
        1枚5円（50枚単位）＋送料実費<br />
        B5両面、フルカラー、裏面に上映会情報印刷用の余白あり
      </p>
      <div class="flex flex-wrap gap-4 mt-4">
        <img
          v-for="image in [
            {
              src: useAsset('four-walling/flyer_india_diary_front.jpg'),
              alt: 'インド日記チラシ表',
            },
            {
              src: useAsset('four-walling/flyer_goodbye_ur_front.jpg'),
              alt: 'さようならURチラシ表',
            },
            {
              src: useAsset('four-walling/flyer_brian_and_co_front.jpg'),
              alt: 'ブライアンと仲間たちチラシ表',
            },
            {
              src: useAsset('four-walling/flyer_india_diary_back.jpg'),
              alt: 'インド日記チラシ裏',
            },
            {
              src: useAsset('four-walling/flyer_goodbye_ur_back.jpg'),
              alt: 'さようならURチラシ裏',
            },
            {
              src: useAsset('four-walling/flyer_brian_and_co_back.jpg'),
              alt: 'ブライアンと仲間たちチラシ裏',
            },
          ]"
          :key="`flyer-${image.src}`"
          :src="image.src"
          :alt="image.alt"
          class="w-40 border border-black"
        />
      </div>

      <h4 class="mt-4">映画のポスター</h4>
      <p class="mt-2">
        1枚300円（1枚単位）＋送料実費<br />
        『インド日記』=B2片面、フルカラー<br />
        『さようならUR』= B2片面、フルカラー<br />
        『ブライアンと仲間たち』= A1片面、フルカラー
      </p>
      <div class="flex flex-wrap gap-4 mt-4">
        <img
          v-for="image in [
            {
              src: useAsset('four-walling/poster_india_diary.jpg'),
              alt: 'インド日記ポスター',
            },
            {
              src: useAsset('four-walling/poster_goodbye_ur.jpg'),
              alt: 'さようならURポスター',
            },
            {
              src: useAsset('four-walling/poster_brian_and_co.jpg'),
              alt: 'ブライアンと仲間たちポスター',
            },
          ]"
          :key="`poster-${image.src}`"
          :src="image.src"
          :alt="image.alt"
          class="w-40 border border-black"
        />
      </div>

      <h4 class="mt-4">
        JASRACへの楽曲使用料 （『ブライアンと仲間たち』、『さようならUR』のみ）
      </h4>
      <p class="mt-2">
        入場料が有料の場合は、日本音楽著作権協会（JASRAC）への楽曲使用料支払い義務が発生します。主催者様の名義で、上映日の5日前までにJASRACへ手続きをお願いします。<br />
        JASRACへの手続きと使用料計算方法の目安は<ExternalLink
          href="https://www.jasrac.or.jp/users/"
          >こちら</ExternalLink
        >
        <br />
        JASRACの楽曲使用料（ビデオ上映使用料）の目安：座席数、入場料等により異なりますが、100名収容の会場で入場料500円の場合、1回の上映につき約300～400円です。
      </p>
    </Section>
    <ButtonLink to="/contact/" class="mt-16">お問い合わせ</ButtonLink>
  </NuxtLayout>
</template>
