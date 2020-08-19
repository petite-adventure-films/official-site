export { default as CardFilm } from '../../components/card_film.vue'
export { default as CardNews } from '../../components/card_news.vue'

export const LazyCardFilm = import('../../components/card_film.vue' /* webpackChunkName: "components/card_film" */).then(c => c.default || c)
export const LazyCardNews = import('../../components/card_news.vue' /* webpackChunkName: "components/card_news" */).then(c => c.default || c)
