<script setup lang="ts">
import { movements } from '~/constants/takahatadai73';

const isModalOpen = ref(false);
const imgPathToEnlarge = ref('');

const enlargeImage = (year: number, month: number, num: number) => {
  isModalOpen.value = true;
  const paddedMonth = month.toString().padStart(2, '0');
  imgPathToEnlarge.value = useAsset(
    `takahatadai73/movements_${year}${paddedMonth}_${num.toString()}.jpg`,
  );
};
</script>

<template>
  <section class="mt-48">
    <h3
      class="bg-tkhd73-yellow w-fit mx-auto p-2 -skew-y-3 text-xl sm:text-xl text-tkhd73-green"
    >
      高畑台団地の今
    </h3>
    <p class="text-center mt-8">
      高幡台団地地区・地区まちづくり<br />計画について
    </p>
    <p class="mt-4">
      73号棟問題が表面化した2011年から、高幡台団地自治会、管理組合（分譲）、UR、日野市の4者による、73号棟跡地問題を中心とした高幡台団地地区の再活用について検討が重ねられてきました。
    </p>
    <p class="mt-2">
      最初4者勉強会として発足した協議体は、その後準備会を経て2016年、地区まちづくり協議会と改組、2017年12月に日野市まちづくり条例に基づき、「高幡台団地地区
      地区まちづくり計画」が作成されました。73号棟問題は、その跡地利用を含め、地域住民（自治会、管理組合）を中心としたURと自治体を巻き込んだ協議体の結成につながり、地域活性化の取り組みの中に生かされようとしています。
    </p>
    <a
      :href="`/assets/documents/takahatadai73/town_planning.pdf`"
      download="まちづくり計画案.pdf"
      target="_blank"
      class="flex items-center link-text text-xs mt-2"
      >まちづくり計画案.pdf</a
    >

    <div class="flex flex-wrap mt-4 gap-y-4">
      <div
        v-for="(flyers, key) in movements"
        :key="key"
        class="w-full"
        :class="[
          flyers.count > 2 ? 'sm:w-full' : 'sm:w-1/2',
          flyers.year === 2019 ? 'sm:w-full' : '',
        ]"
      >
        <h4>{{ flyers.year }}年{{ flyers.month }}月</h4>
        <div class="flex flex-wrap gap-2 mt-2 items-start">
          <button
            v-for="(_, num) in [...Array(flyers.count)].map((_, i) => i + 1)"
            :key="num"
            class="group relative block w-32 sm:w-40 h-auto"
            @click="enlargeImage(flyers.year, flyers.month, num + 1)"
          >
            <img
              :src="
                useAsset(
                  `takahatadai73/movements_${flyers.year}${flyers.month.toString().padStart(2, '0')}_${num + 1}.jpg`,
                )
              "
              class="block border border-white"
            />
            <div
              class="absolute bottom-1 right-1 flex justify-center items-center rounded-full w-6 h-6 border-2 border-white bg-tkhd73-green-shadow text-xs sm:group-hover:bg-white"
            >
              🔍
            </div>
          </button>
        </div>
      </div>
    </div>
  </section>

  <Modal :open="isModalOpen" @close="isModalOpen = false">
    <img :src="imgPathToEnlarge" class="block" />
  </Modal>
</template>
