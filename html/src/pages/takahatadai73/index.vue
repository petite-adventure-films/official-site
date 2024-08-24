<script setup lang="ts">
import { keyMessages, urTimeline } from '~/constants/takahatadai73';

definePageMeta({
  title: '高幡台団地73号棟に住み続けたい住民の会',
  layout: false,
});
</script>

<template>
  <NuxtLayout name="bg-none">
    <div class="fixed -z-10 top-0 left-0 w-full h-full">
      <img
        src="~/assets/images/takahatadai73/bg.jpg"
        class="w-full h-full object-cover"
        alt=""
      />
    </div>
    <div class="mt-8">
      <div class="bg-white bg-opacity-25 p-8">
        <H3 class="text-center">復刻版公開に寄せて</H3>
        <p class="pt-8">
          映画『さようならUR』の主人公でもある、「高幡台団地73号棟に住み続けたい住民の会」。<br />
          2013年に立ち退き裁判をたたかっていた当時の「住民の会」ホームページが、この度復刻版となって登場しました！<br />
          今回新たに、裁判後の情報も追加しました。UR団地の削減方針は、現在も維持されたままです。高幡台団地73号棟のたたかいが、全国で建て替え・取り壊し問題に直面する方々の取り組みに生かされることを願います。
        </p>
        <p class="text-right text-xs pt-4">
          2020年10月<br />
          プチ・アドベンチャー・フィルムズ<br />
          早川由美子
        </p>
      </div>

      <article class="mt-96 mb-32">
        <div>
          <header>
            <h2 class="text-4xl font-black palt text-white">
              <div class="block w-fit bg-tkhd73-yellow mx-auto p-4 -skew-y-6">
                <span class="text-tkhd73-green">きいろい</span>はたに
              </div>
              <div
                class="block w-fit bg-tkhd73-yellow mt-2 mx-auto p-4 -skew-y-6"
              >
                <span class="text-tkhd73-green">ねがいを</span>こめて
              </div>
            </h2>
            <p class="mt-48 font-serif text-2xl text-center">
              高幡台団地73号棟に<br />住み続けたい住民の会<br />の記録
            </p>
          </header>

          <div class="flex flex-col items-center gap-16 mt-48">
            <div
              v-for="(message, key) in keyMessages"
              :key="`keyMessage${key}`"
            >
              <p
                class="relative border-2 w-fit p-4 border-tkhd73-ur text-tkhd73-ur"
              >
                <span class="absolute -top-5 left-0 block text-xs"
                  >URは言います</span
                >
                <span v-html="message.ur" />
              </p>
              <p>
                <span
                  class="block bg-tkhd73-yellow -mt-2 -ml-2 px-2 py-1 w-fit -skew-y-3 text-xs text-tkhd73-green"
                  >住民はURに言います</span
                >
                <span
                  class="block mt-1 text-tkhd73-green font-bold text-2xl"
                  v-html="message.residents"
                />
              </p>
            </div>
          </div>

          <div class="sticky bottom-0 -z-10 mt-48">
            <img src="~/assets/images/takahatadai73/takahatadai73.png" alt="" />
          </div>
        </div>

        <section class="mt-48 [&_p+p]:mt-2">
          <h3
            class="bg-tkhd73-yellow w-fit mx-auto p-2 -skew-y-3 text-xl sm:text-2xl font-bold text-tkhd73-green"
          >
            住民からのご挨拶
          </h3>
          <p class="text-xs mt-4 text-center">※2013年当時の挨拶</p>
          <p class="mt-4">
            私たちのホームページにおいでいただきありがとうございます。
          </p>
          <p>
            2008年5月1日、読売新聞がスクープして社会問題となった、URの耐震不足住棟の取り壊し問題。この報道で名前が公表された団地は、関東地方では、私たち高幡台団地73号棟のほか、千葉・幸町団地と埼玉・武里団地でした。すでにこの2団地の該当住棟は取り壊されて、更地となってしまいましたが、私たちの73号棟はしっかりと建っています。
          </p>
          <p>
            あれから4年半。私たちは悩み、苦しみ、そして多くの皆様の協力を得ながらいろいろなことを学び、行動してきました。早川由美子監督のドキュメンタリー映画「さようならUR」が詳しく伝えています。
          </p>
          <p><strong>「住み続けたい」と裁判をたたかっています！</strong></p>
          <p>
            UR都市機構は2011年1月、残っている7戸の住民に対し、住宅の明け渡しを求め裁判に訴えてきました。「73号棟は耐震強度が不足しており、多額の費用がかかる耐震補強をしても住宅環境が悪くなり、商品価値がなくなる。よって建物を除却することにした。この処置は賃貸契約の更新拒絶の正当事由となるので、ただちに建物を明け渡せ。契約終了後は不当占拠にあたるから、1.5倍の損害金を支払え」というのです。
          </p>
          <p>
            URは、私たちに「丁寧な説明」をし、「真摯に対応」してきたといいます。しかし私たちは73号棟の耐震補強方法は、URが説明する方法しかないのか、疑問に感じました。73号棟の耐震補強を検討するための基礎資料である、73号棟の構造設計図を公開するよう、情報開示請求をしました。しかし、開示された構造図は全66ページすべて黒塗りでした。
          </p>
          <p>
            <strong
              >耐震性不足の建物は全国に存在。裁判の行方が注目されます！</strong
            >
          </p>
          <p>
            一昨年の東日本大震災以来、建物の耐震補強の必要性が高まっています。しかし耐震補強が不足している賃貸住宅は国内にたくさん存在しています。この裁判では、UR賃貸住宅の耐震強度不足が、賃貸契約の更新拒絶の「正当事由」となるのかが問われています。耐震強度不足が、更新拒絶の正当事由となるかが主な争点となった裁判は、今回が初めてといいます。ですから今、私たちの裁判は法律家を始め、住宅問題に心を寄せる人たちからも注目されています。
          </p>
          <p>
            このホームページでは、73号棟問題の経緯と裁判の経過を、これからも伝えていきます。高幡台団地73号棟のベランダには、住み続けたいという願いをこめて、私たちの黄色い旗が今日もはためいています。ご意見、ご感想をお寄せくださいますよう、お願いいたします。
          </p>
          <p class="text-right text-xs">
            2013年1月<br />
            高幡台団地73号棟に住み続けたい住民の会<br />
            住民一同
          </p>
        </section>

        <section class="mt-48">
          <h2 class="text-xl sm:text-2xl text-tkhd73-ur font-bold">
            URって何？
          </h2>
          <div class="relative sm:w-96">
            <div class="mt-4 [&_p+p]:mt-2 sm:pr-4">
              <p>
                高度経済成長真っ只中の<strong>1955年</strong>、
                主に<strong>大都市圏の深刻な住宅不足を解消</strong>するため、
                国の住宅政策の一環として設立された、日本住宅公団が始まり。
              </p>
              <p>
                <strong>1960年～70年代</strong
                >にかけ、<strong>全国各地で大量の団地を建設</strong>すると共に、
                <strong>ニュータウンの計画や建設</strong
                >、そして<strong>都市再開発事業</strong>にも進出した。
              </p>
              <p>
                日本住宅公団は、時代や政治の流れと共にその役割を変貌させつつ、
                名称も1981年には住宅・都市整備公団、
                1999年には都市基盤整備公団、そして<strong>2004年に都市再生機構（UR）</strong>となり現在に至る。
              </p>
              <p>
                URは、全国で約76万の住戸を抱える、”日本最大の大家”。
                しかし、行政改革の煽りを受け、 現在は<strong
                  class="text-tkhd73-green"
                  >民営化も視野に入れた組織の見直し</strong
                >が検討されている。
                14兆円という巨額の負債と、住宅不足は解消しURの目的は終えたというのが、
                見直しの主な理由だ。
              </p>
              <p>
                URの団地に関しては、削減の方針が打ち出され、
                10年間（2018年まで）で<strong class="text-tkhd73-green"
                  >既存住宅8万戸を削減する「UR賃貸住宅再生・再編計画」</strong
                >が進行中。
              </p>
              <p>
                <strong class="text-tkhd73-ur"
                  >高幡台団地73号棟の取り壊し</strong
                >は、URの民営化、団地の削減が打ち出されたのと、<strong>時を同じくして発表</strong>された。
                それ以前は、耐震補強をして使い続けると73号棟住民には周知していたのだが、一転して取り壊しに転じた。
              </p>
              <p>
                73号棟の取り壊しについて、URは耐震性不足のためと主張するが、
                <strong class="text-tkhd73-ur"
                  >その背景にはURの民営化、そして団地の削減方針があるのでは？と指摘する専門家も多い。</strong
                >
              </p>
            </div>
            <ul
              class="flex flex-col gap-8 mt-4 p-4 border-l border-tkhd73-ur sm:w-56 sm:h-full sm:mt-0 sm:absolute sm:top-0 sm:-right-56"
            >
              <li
                v-for="(timeline, key) in urTimeline"
                :key="`urTimeline${key}`"
                class="relative"
              >
                <span
                  class="absolute block w-2 h-2 bg-tkhd73-ur rounded top-0 -left-5"
                />
                <span class="block font-bold text-tkhd73-ur"
                  >{{ timeline.year }}年</span
                >
                <p class="flex">
                  <img
                    :src="useAsset(`takahatadai73/${timeline.logo}`)"
                    class="h-6"
                  />
                  <span class="pl-1">{{ timeline.name }}</span>
                </p>
                <p class="mt-2" v-html="timeline.description" />
              </li>
            </ul>
          </div>
        </section>

        <Takahatadai73Timeline />
        <Takahatadai73GoodbyeGallery />
        <Takahatadai73Movements />
        <Takahatadai73Residents />
        <Takahatadai73About />
      </article>
    </div>
  </NuxtLayout>
</template>
