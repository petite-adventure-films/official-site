import Vue from 'vue'
import VueRouter from 'vue-router'

import Top from 'VUE/pages/events/top.vue'
import Archive from 'VUE/pages/events/archive.vue'
import Details from 'VUE/pages/events/_id.vue'

Vue.use(VueRouter)

const router = new VueRouter({
    routes: [
        {
            name: 'top'
            , path: '/'
            , component: Top
        }
        , {
            name: 'archive'
            , path: '/archive/:year'
            , component: Archive
            , props: true
        }
        , {
            name: 'event'
            , path: '/:id'
            , component: Details
            , props: true
        }
        
    ]
})

export default router