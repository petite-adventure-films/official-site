export { default as Logo } from '../../components/Logo.vue'
export { default as CardEvent } from '../../components/card_event.vue'
export { default as CardVideo } from '../../components/card_video.vue'

export const LazyLogo = import('../../components/Logo.vue' /* webpackChunkName: "components/Logo'}" */).then(c => c.default || c)
export const LazyCardEvent = import('../../components/card_event.vue' /* webpackChunkName: "components/card_event'}" */).then(c => c.default || c)
export const LazyCardVideo = import('../../components/card_video.vue' /* webpackChunkName: "components/card_video'}" */).then(c => c.default || c)
