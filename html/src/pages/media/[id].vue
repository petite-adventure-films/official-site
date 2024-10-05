<script setup lang="ts">
import type { Media } from '~/types/media';
import * as PDFJS from 'pdfjs-dist'
PDFJS.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS.version}/build/pdf.worker.mjs`

definePageMeta({
  layout: false,
});

const config = useRuntimeConfig();
const route = useRoute();

const pageId = route.params.id as string;
const { detail } = await useWpGetListDetail<Media>('media_detail', { pageId });

route.meta.title = `${detail.value?.data.title} - メディア紹介`;
useSeoMeta({
  ogUrl: `${config.public.SITE_URL}media/${detail.value?.data.id}/`,
});

const $pdfViewer = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  const loadingTask = PDFJS.getDocument({
    url: detail.value?.data.media_pdf_url,
    cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS.version}/cmaps/`,
    cMapPacked: true,
  })
  loadingTask.promise.then((pdf) => {
    // 1ページ目を取得
    // 現状1ページしかないので、決め内で取得
    pdf.getPage(1).then((page) => {
      const scale = 1.5
      const viewport = page.getViewport({ scale: scale })
      // Canvasを作成してPDFをレンダリング
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.height = viewport.height
      canvas.width = viewport.width
      // CanvasをDOMに追加
      if ($pdfViewer.value) {
        $pdfViewer.value.appendChild(canvas)
      }
      // PDFページをCanvasにレンダリング
      if (context) {
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        }
        page.render(renderContext)
      } else {
        console.error('Failed to get canvas context');
      }
    })
  }, (reason) => {
    // PDFのロードに失敗した場合
    console.error(reason)
  })
});
</script>

<template>
  <NuxtLayout name="post">
    <template #breadcrumb>
      <BreadCrumb :crumbs="[{ to: '/media/', name: 'メディア紹介' }]" />
    </template>
    <template v-if="detail" #headerTags>
      <ArticleHeaderTags :film-tags="detail.data.film_tags" />
    </template>
    <template v-if="detail" #h2>{{ detail.data.title }}</template>
    <Video
      v-if="detail && detail.data.media_video"
      :youtube-id="detail.data.media_video"
    />
    <div v-if="detail && detail.data.media_pdf_url" ref="$pdfViewer" class="w-full [&_canvas]:w-full [&_canvas]:border [&_canvas]:border-black"/>
    <AttachedInfo
      v-if="detail"
      :info="[
        detail.data.media_name,
        detail.data.media_volume,
        detail.data.media_contents,
      ]"
    />
    <ArticleContents v-if="detail" :contents="detail.data.content" />
    <article
      v-if="detail && detail.data.article_title && detail.data.article_contents"
      class="relative mt-8 border border-black py-8 px-4 before:content-['記事本文'] before:text-xs before:px-2 before:py-1 before:bg-gray-100 before:absolute before:right-0 before:top-0"
    >
      <H3 class="mb-8">
        {{ detail.data.article_title }}
        <template #sub>{{ detail.data.article_subtitle }}</template>
      </H3>
      <div
        v-if="detail.data.article_contents"
        v-html="detail.data.article_contents"
      />
    </article>
    <PublishedDate
      v-if="detail"
      :published-date="detail.data.published"
      class="mt-8"
    />
  </NuxtLayout>
</template>
