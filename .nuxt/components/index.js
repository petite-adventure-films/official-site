export { default as Logo } from '../../components/Logo.vue'
export { default as CardEvent } from '../../components/card_event.vue'
export { default as CardFilm } from '../../components/card_film.vue'
export { default as CardMedia } from '../../components/card_media.vue'
export { default as CardVideo } from '../../components/card_video.vue'
export { default as ContactUs } from '../../components/contact_us.vue'

export const LazyLogo = import('../../components/Logo.vue' /* webpackChunkName: "components/Logo'}" */).then(c => c.default || c)
export const LazyCardEvent = import('../../components/card_event.vue' /* webpackChunkName: "components/card_event'}" */).then(c => c.default || c)
export const LazyCardFilm = import('../../components/card_film.vue' /* webpackChunkName: "components/card_film'}" */).then(c => c.default || c)
export const LazyCardMedia = import('../../components/card_media.vue' /* webpackChunkName: "components/card_media'}" */).then(c => c.default || c)
export const LazyCardVideo = import('../../components/card_video.vue' /* webpackChunkName: "components/card_video'}" */).then(c => c.default || c)
export const LazyContactUs = import('../../components/contact_us.vue' /* webpackChunkName: "components/contact_us'}" */).then(c => c.default || c)
