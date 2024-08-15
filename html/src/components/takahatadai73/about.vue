<script setup lang="ts"></script>

<template>
  <section class="mt-48">
    <h3
      class="bg-tkhd73-yellow w-fit mx-auto p-2 -skew-y-3 text-xl sm:text-xl text-tkhd73-green text-center"
    >
      私たちについて<br />もっと詳しく知りたい方は…
    </h3>
    <div class="sm:flex items-start gap-4 mt-8">
      <img
        src="~/assets/images/films/goodbye_ur_thumbnail.jpg"
        alt="さようならUR"
        class="w-56"
      />
      <div class="mt-4 sm:mt-0">
        <p>
          この高幡台団地73号棟問題、そして私たちの活動は、ドキュメンタリー映画『さようならUR』（監督：早川由美子）に詳しく描かれています。
        </p>
        <p class="mt-2">
          映画は、これまでに全国各地で上映され、山形国際ドキュメンタリー映画祭2011では、スカパー！IDEHA賞を受賞しました。中国、韓国でも上映され、国境を越えた共感が寄せられました。映画本編に、3時間の特典映像を加えたDVDが発売中です。ぜひご覧ください！
        </p>
        <ButtonLink to="/films/16" class="mt-4">詳しくはこちら</ButtonLink>
      </div>
    </div>
    <Video youtube-id="c7A2uPQ2Pm8" class="mt-4" />
  </section>
</template>
