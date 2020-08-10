export { default as Breadcrumbs } from '../../components/breadcrumbs.vue'
export { default as CardEvent } from '../../components/card_event.vue'
export { default as CardFilm } from '../../components/card_film.vue'
export { default as CardMedia } from '../../components/card_media.vue'
export { default as CardNews } from '../../components/card_news.vue'
export { default as CardPost } from '../../components/card_post.vue'
export { default as CardVideo } from '../../components/card_video.vue'
export { default as ContactUs } from '../../components/contact_us.vue'
export { default as Footer } from '../../components/footer.vue'
export { default as Header } from '../../components/header.vue'
export { default as Navi } from '../../components/navi.vue'

export const LazyBreadcrumbs = import('../../components/breadcrumbs.vue' /* webpackChunkName: "components/breadcrumbs'}" */).then(c => c.default || c)
export const LazyCardEvent = import('../../components/card_event.vue' /* webpackChunkName: "components/card_event'}" */).then(c => c.default || c)
export const LazyCardFilm = import('../../components/card_film.vue' /* webpackChunkName: "components/card_film'}" */).then(c => c.default || c)
export const LazyCardMedia = import('../../components/card_media.vue' /* webpackChunkName: "components/card_media'}" */).then(c => c.default || c)
export const LazyCardNews = import('../../components/card_news.vue' /* webpackChunkName: "components/card_news'}" */).then(c => c.default || c)
export const LazyCardPost = import('../../components/card_post.vue' /* webpackChunkName: "components/card_post'}" */).then(c => c.default || c)
export const LazyCardVideo = import('../../components/card_video.vue' /* webpackChunkName: "components/card_video'}" */).then(c => c.default || c)
export const LazyContactUs = import('../../components/contact_us.vue' /* webpackChunkName: "components/contact_us'}" */).then(c => c.default || c)
export const LazyFooter = import('../../components/footer.vue' /* webpackChunkName: "components/footer'}" */).then(c => c.default || c)
export const LazyHeader = import('../../components/header.vue' /* webpackChunkName: "components/header'}" */).then(c => c.default || c)
export const LazyNavi = import('../../components/navi.vue' /* webpackChunkName: "components/navi'}" */).then(c => c.default || c)
