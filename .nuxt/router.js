import Vue from 'vue'
import Router from 'vue-router'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _c1a3ba7c = () => interopDefault(import('../pages/event/index.vue' /* webpackChunkName: "pages/event/index" */))
const _9f1fbf1c = () => interopDefault(import('../pages/film/index.vue' /* webpackChunkName: "pages/film/index" */))
const _515ec1fe = () => interopDefault(import('../pages/news/index.vue' /* webpackChunkName: "pages/news/index" */))
const _c510fd0c = () => interopDefault(import('../pages/event/_slug.vue' /* webpackChunkName: "pages/event/_slug" */))
const _a28d01ac = () => interopDefault(import('../pages/film/_slug.vue' /* webpackChunkName: "pages/film/_slug" */))
const _54cc048e = () => interopDefault(import('../pages/news/_slug.vue' /* webpackChunkName: "pages/news/_slug" */))
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
    path: "/event",
    component: _c1a3ba7c,
    name: "event"
  }, {
    path: "/film",
    component: _9f1fbf1c,
    name: "film"
  }, {
    path: "/news",
    component: _515ec1fe,
    name: "news"
  }, {
    path: "/event/:slug",
    component: _c510fd0c,
    name: "event-slug"
  }, {
    path: "/film/:slug",
    component: _a28d01ac,
    name: "film-slug"
  }, {
    path: "/news/:slug",
    component: _54cc048e,
    name: "news-slug"
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
