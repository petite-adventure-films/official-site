import Vue from 'vue'
import Router from 'vue-router'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _e38a65e0 = () => interopDefault(import('../pages/blog/index.vue' /* webpackChunkName: "pages/blog/index" */))
const _c2dc62aa = () => interopDefault(import('../pages/channel/index.vue' /* webpackChunkName: "pages/channel/index" */))
const _18fb923c = () => interopDefault(import('../pages/copyrights-disclaimers.vue' /* webpackChunkName: "pages/copyrights-disclaimers" */))
const _23381a0c = () => interopDefault(import('../pages/director/index.vue' /* webpackChunkName: "pages/director/index" */))
const _c1a3ba7c = () => interopDefault(import('../pages/event/index.vue' /* webpackChunkName: "pages/event/index" */))
const _9f1fbf1c = () => interopDefault(import('../pages/film/index.vue' /* webpackChunkName: "pages/film/index" */))
const _58cc7c26 = () => interopDefault(import('../pages/four_walling/index.vue' /* webpackChunkName: "pages/four_walling/index" */))
const _1668c9ec = () => interopDefault(import('../pages/gathering-the-personal-information.vue' /* webpackChunkName: "pages/gathering-the-personal-information" */))
const _4c5a8b8c = () => interopDefault(import('../pages/media/index.vue' /* webpackChunkName: "pages/media/index" */))
const _515ec1fe = () => interopDefault(import('../pages/news/index.vue' /* webpackChunkName: "pages/news/index" */))
const _4b236982 = () => interopDefault(import('../pages/privacy-policy.vue' /* webpackChunkName: "pages/privacy-policy" */))
const _0d7aece5 = () => interopDefault(import('../pages/series/index.vue' /* webpackChunkName: "pages/series/index" */))
const _ef6a19d0 = () => interopDefault(import('../pages/specified-commercial-transaction-law.vue' /* webpackChunkName: "pages/specified-commercial-transaction-law" */))
const _68ccd393 = () => interopDefault(import('../pages/system-requirements.vue' /* webpackChunkName: "pages/system-requirements" */))
const _4a465335 = () => interopDefault(import('../pages/workshop/index.vue' /* webpackChunkName: "pages/workshop/index" */))
const _32ddb570 = () => interopDefault(import('../pages/event/archive/_archive.vue' /* webpackChunkName: "pages/event/archive/_archive" */))
const _e6f7a870 = () => interopDefault(import('../pages/blog/_slug.vue' /* webpackChunkName: "pages/blog/_slug" */))
const _6e2e14a4 = () => interopDefault(import('../pages/category/_slug.vue' /* webpackChunkName: "pages/category/_slug" */))
const _c649a53a = () => interopDefault(import('../pages/channel/_slug.vue' /* webpackChunkName: "pages/channel/_slug" */))
const _c510fd0c = () => interopDefault(import('../pages/event/_slug.vue' /* webpackChunkName: "pages/event/_slug" */))
const _a28d01ac = () => interopDefault(import('../pages/film/_slug.vue' /* webpackChunkName: "pages/film/_slug" */))
const _4aa3ea44 = () => interopDefault(import('../pages/media/_slug.vue' /* webpackChunkName: "pages/media/_slug" */))
const _54cc048e = () => interopDefault(import('../pages/news/_slug.vue' /* webpackChunkName: "pages/news/_slug" */))
const _0bc44b9d = () => interopDefault(import('../pages/series/_slug.vue' /* webpackChunkName: "pages/series/_slug" */))
const _0e435c92 = () => interopDefault(import('../pages/index.vue' /* webpackChunkName: "pages/index" */))

// TODO: remove in Nuxt 3
const emptyFn = () => {}
const originalPush = Router.prototype.push
Router.prototype.push = function push (location, onComplete = emptyFn, onAbort) {
  return originalPush.call(this, location, onComplete, onAbort)
}

Vue.use(Router)

export const routerOptions = {
  mode: 'history',
  base: decodeURI('/'),
  linkActiveClass: 'nuxt-link-active',
  linkExactActiveClass: 'nuxt-link-exact-active',
  scrollBehavior,

  routes: [{
    path: "/blog",
    component: _e38a65e0,
    name: "blog"
  }, {
    path: "/channel",
    component: _c2dc62aa,
    name: "channel"
  }, {
    path: "/copyrights-disclaimers",
    component: _18fb923c,
    name: "copyrights-disclaimers"
  }, {
    path: "/director",
    component: _23381a0c,
    name: "director"
  }, {
    path: "/event",
    component: _c1a3ba7c,
    name: "event"
  }, {
    path: "/film",
    component: _9f1fbf1c,
    name: "film"
  }, {
    path: "/four_walling",
    component: _58cc7c26,
    name: "four_walling"
  }, {
    path: "/gathering-the-personal-information",
    component: _1668c9ec,
    name: "gathering-the-personal-information"
  }, {
    path: "/media",
    component: _4c5a8b8c,
    name: "media"
  }, {
    path: "/news",
    component: _515ec1fe,
    name: "news"
  }, {
    path: "/privacy-policy",
    component: _4b236982,
    name: "privacy-policy"
  }, {
    path: "/series",
    component: _0d7aece5,
    name: "series"
  }, {
    path: "/specified-commercial-transaction-law",
    component: _ef6a19d0,
    name: "specified-commercial-transaction-law"
  }, {
    path: "/system-requirements",
    component: _68ccd393,
    name: "system-requirements"
  }, {
    path: "/workshop",
    component: _4a465335,
    name: "workshop"
  }, {
    path: "/event/archive/:archive?",
    component: _32ddb570,
    name: "event-archive-archive"
  }, {
    path: "/blog/:slug",
    component: _e6f7a870,
    name: "blog-slug"
  }, {
    path: "/category/:slug?",
    component: _6e2e14a4,
    name: "category-slug"
  }, {
    path: "/channel/:slug",
    component: _c649a53a,
    name: "channel-slug"
  }, {
    path: "/event/:slug",
    component: _c510fd0c,
    name: "event-slug"
  }, {
    path: "/film/:slug",
    component: _a28d01ac,
    name: "film-slug"
  }, {
    path: "/media/:slug",
    component: _4aa3ea44,
    name: "media-slug"
  }, {
    path: "/news/:slug",
    component: _54cc048e,
    name: "news-slug"
  }, {
    path: "/series/:slug",
    component: _0bc44b9d,
    name: "series-slug"
  }, {
    path: "/",
    component: _0e435c92,
    name: "index"
  }],

  fallback: false
}

export function createRouter () {
  return new Router(routerOptions)
}
