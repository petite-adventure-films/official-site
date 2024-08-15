<script setup lang="ts">
import type { News } from '~/types/news';

const $animationWrapper = ref<HTMLElement | null>(null);
const $kv = ref<HTMLElement | null>(null);
const $introCatch = ref<HTMLElement | null>(null);
const $bgVideo = ref<HTMLVideoElement | null>(null);
const $maskVideo = ref<HTMLVideoElement | null>(null);

const { query } = useRoute();

if (query?.op === 'skip') {
  $animationWrapper.value?.classList.add('skipped');
}

const { posts: news } = await useWpGetList<News>('news', {
  query: { per_page: 1 },
});

const isModalOpen = ref(false);

onMounted(() => {
  const kvTop = $kv.value?.offsetTop || 0;
  const introCatchTop = $introCatch.value?.offsetTop || 0;
  $introCatch.value?.setAttribute(
    'style',
    `--pos-to: ${(introCatchTop - kvTop) * -1}px`,
  );
  !query?.op && $animationWrapper.value?.classList.add('loaded');

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
});
</script>

<template>
  <div ref="$animationWrapper">
    <video
      ref="$bgVideo"
      autoplay
      loop
      muted
      preload
      playsinline
      class="fixed top-0 left-0 -z-10 w-full h-full object-cover"
    >
      <source src="~/assets/video/home.mp4" type="video/mp4" />
    </video>
    <div
      class="fixed top-0 left-0 -z-10 w-full h-full bg-black bg-opacity-50"
    />
    <div
      v-if="!query?.op"
      class="absolute top-0 left-0 w-full h-full flex items-center justify-center"
    >
      <div ref="$introCatch" class="intro-catch">
        <KvMessage />
      </div>
    </div>

    <div class="contents-wrapper" :class="query?.op ? 'op-skipped' : ''">
      <div class="wrapper bg-white">
        <AppHeader />
        <main>
          <div ref="$kv" class="mt-4 text-center">
            <div class="mask w-[320px] h-[220px] mx-auto">
              <video
                ref="$maskVideo"
                autoplay
                loop
                muted
                preload
                playsinline
                class="fixed top-0 left-0 z-0 w-full h-full object-cover"
              >
                <source src="~/assets/video/home.mp4" type="video/mp4" />
              </video>
              <div
                class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-20"
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
            📹 オープニング映像の全編を見る（1:15）
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
              >🛍️ 公式SHOP</ButtonLink
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
      <video playsinline controls>
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
