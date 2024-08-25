<script setup lang="ts">
import type { News } from '~/types/news';

const $animationWrapper = ref<HTMLElement | null>(null);
const $contentsWrapper = ref<HTMLElement | null>(null);
const $kv = ref<HTMLElement | null>(null);
const $introCatch = ref<HTMLElement | null>(null);
const $bgVideo = ref<HTMLVideoElement | null>(null);
const $bgVideoPoster = ref<HTMLImageElement | null>(null);
const $maskVideo = ref<HTMLVideoElement | null>(null);
const $maskVideoPoster = ref<HTMLImageElement | null>(null);

const { query } = useRoute();

const isPC = useMediaQuery('(min-width: 768px)');
const opSkipped = query.op === 'skip';
const isModalOpen = ref(false);

const { posts: news } = await useWpGetList<News>('news', {
  query: { per_page: 1 },
});

const opForcedToEnd = () => {
  $animationWrapper.value?.classList.add('loaded');
  $animationWrapper.value?.classList.add('op-skipped');
  $contentsWrapper.value?.classList.add('op-skipped');

  if (isPC.value) {
    $bgVideo.value?.play().catch(() => {
      $bgVideo.value?.classList.add('hidden');
    });
  } else {
    $bgVideo.value?.classList.add('hidden');
  }
};

const kvForcedToEnd = () => {
  $maskVideo.value?.classList.add('hidden');
};

// mountされる前に一度実行
if (opSkipped) {
  opForcedToEnd();
  $maskVideo.value?.play().catch(() => {
    kvForcedToEnd();
  });
}

onMounted(() => {
  // 低電力モードなど、なんらかの理由で動画が再生できない場合、OPをスキップ
  $bgVideo.value?.play().catch(() => {
    opForcedToEnd();
  });

  // OPが終了したら、SPはbgVideoは非表示
  $introCatch.value?.addEventListener('animationend', () => {
    if (!isPC.value) {
      $bgVideo.value?.pause();
      $bgVideo.value?.classList.add('opacity-0');
      $bgVideo.value?.addEventListener('transitionend', () => {
        $bgVideo.value?.classList.add('hidden');
      });
    }
  });

  // op=skip がクエリに含まれている場合、OPをスキップ、maskVideoを再生
  if (opSkipped) {
    opForcedToEnd();
    $maskVideo.value?.play().catch(() => {
      kvForcedToEnd();
    });
  } else {
    $bgVideo.value?.play().catch(() => {
      opForcedToEnd();
    });
    $maskVideo.value?.play().catch(() => {
      kvForcedToEnd();
    });

    const kvTop = $kv.value?.offsetTop || 0;
    const introCatchTop = $introCatch.value?.offsetTop || 0;
    $introCatch.value?.setAttribute(
      'style',
      `--pos-to: ${(introCatchTop - kvTop) * -1}px`,
    );
    $animationWrapper.value?.classList.add('loaded');

    // PCの場合、bgVideoとmaskVideoの再生位置を同期
    if (isPC.value) {
      let isMaskVideoPlayedAgain = false;
      $maskVideo.value?.addEventListener('playing', () => {
        if (!isMaskVideoPlayedAgain) {
          const time = $bgVideo.value?.currentTime;
          $maskVideo.value.currentTime = time;
          isMaskVideoPlayedAgain = true;
        }
      });
      $maskVideo.value?.addEventListener('pause', () => {
        isMaskVideoPlayedAgain = false;
      });
    }
  }
});
</script>

<template>
  <div ref="$animationWrapper">
    <div class="fixed top-0 left-0 -z-10 w-full h-full">
      <img
        ref="$bgVideoPoster"
        src="~/assets/images/home/op.png"
        alt=""
        class="absolute top-0 left-0 w-full h-full object-cover"
      />
      <video
        ref="$bgVideo"
        loop="true"
        muted="true"
        preload="true"
        playsinline="true"
        class="absolute top-0 left-0 w-full h-full object-cover"
        :class="{ hidden: opSkipped && !isPC }"
      >
        <source src="~/assets/video/home.mp4" type="video/mp4" />
      </video>
    </div>
    <div class="fixed top-0 left-0 -z-10 w-full h-full op-mask" />
    <div
      v-if="!opSkipped"
      class="absolute top-0 left-0 w-full h-full flex items-center justify-center"
    >
      <div ref="$introCatch" class="intro-catch">
        <KvMessage />
      </div>
    </div>

    <div ref="$contentsWrapper" class="contents-wrapper">
      <div class="wrapper bg-white">
        <AppHeader />
        <main>
          <div ref="$kv" class="mt-8 text-center">
            <div class="mask w-[320px] h-[220px] mx-auto">
              <img
                ref="$maskVideoPoster"
                src="~/assets/images/home/op.png"
                alt=""
                class="fixed top-0 left-0 z-0 w-full h-full object-cover"
              />
              <video
                ref="$maskVideo"
                loop="true"
                muted="true"
                preload="true"
                playsinline="true"
                class="hidden sm:block fixed top-0 left-0 z-0 w-full h-full object-cover"
              >
                <source src="~/assets/video/home.mp4" type="video/mp4" />
              </video>
              <div
                class="fixed top-0 left-0 w-full h-full bg-black sm:bg-opacity-20"
              />
              <KvMessageMask />
            </div>
            <p class="max-w-80 mx-auto mt-4">
              メインストリームのメディアでは取り上げられにくい課題を、マスメディアとはまったく異なる視点と手法で、大胆かつユニークに映像制作を行うプロダクションです。
            </p>
          </div>

          <button
            class="link-text mt-8 mx-auto block text-xs"
            @click="isModalOpen = true"
          >
            オープニング映像の全編を見る（1:15）▶️
          </button>

          <div class="flex flex-wrap justify-center mt-8 gap-2">
            <ButtonLink :disabled="false" type="primary" to="/events/"
              >📢 上映会・イベント</ButtonLink
            >
            <ButtonLink :disabled="false" type="primary" to="/films/"
              >🎬 映画</ButtonLink
            >
            <ButtonLink :disabled="false" type="secondary" to="/director/"
              >😀 監督プロフィール</ButtonLink
            >
            <ButtonLink :disabled="false" type="secondary" to="/channel/"
              >📺 チャンネル</ButtonLink
            >
            <ButtonLink :disabled="false" type="secondary" to="/media/"
              >⭐ メディア紹介</ButtonLink
            >
            <ButtonLink :disabled="false" type="secondary" to="/four-walling/"
              >🍿 自主上映について</ButtonLink
            >
            <ButtonLink :disabled="false" type="secondary" to="/workshop/"
              >📹 映像制作を学びませんか？
            </ButtonLink>
            <ButtonLink :disabled="false" type="secondary" to="/blog/"
              >📝 BLOG</ButtonLink
            >
            <ButtonLink :disabled="false" type="shop" to="/pafshop/"
              >🛍️ SHOP</ButtonLink
            >
          </div>

          <Section title="お知らせ" view-more-to="/news/">
            <ArchiveList v-if="news">
              <NewsList :posts="news.data" />
            </ArchiveList>
          </Section>

          <NuxtLink to="/takahatadai73/" class="block mt-16 group"
            ><img
              src="~/assets/images/films/banner_takahatadai73.jpg"
              alt="「高幡台団地73号棟に住み続けたい住民の会の記録」特設サイトへ移動する"
              class="block sm:group-hover:opacity-75"
          /></NuxtLink>
        </main>
        <AppFooter />
      </div>
    </div>

    <Modal :open="isModalOpen" @close="isModalOpen = false">
      <img src="~/assets/images/home/op.png" alt="" />
      <video muted controls class="absolute w-full top-0 left-0">
        <source src="~/assets/video/home.mp4" type="video/mp4" />
      </video>
    </Modal>
  </div>
</template>

<style scoped>
.contents-wrapper:not(.op-skipped) {
  opacity: 0;
  transition: opacity 1s cubic-bezier(0.65, 0, 0.35, 1) 3.8s;
}
.intro-catch {
  position: absolute;
  transform: translateY(0);
  color: #ffffff;
}
.loaded .intro-catch {
  animation:
    move 2s cubic-bezier(0.65, 0, 0.35, 1) 2s forwards,
    fadeOut 1s cubic-bezier(0.65, 0, 0.35, 1) 4s forwards;
}
.loaded .contents-wrapper {
  opacity: 1;
}
.op-mask {
  background-color: #ffffff;
}
.loaded .op-mask {
  background-color: #000000;
  opacity: 0.5;
}
.mask {
  clip-path: url(#introCatchPath);
}

@keyframes move {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(var(--pos-to));
  }
}
@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
@keyframes fadeOut {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
