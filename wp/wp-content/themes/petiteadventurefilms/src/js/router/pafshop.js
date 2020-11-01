import Vue from 'vue'
import VueRouter from 'vue-router'

import Top from 'VUE/pages/pafshop/top.vue'
import Product from 'VUE/pages/pafshop/product.vue'
import Basket from 'VUE/pages/pafshop/basket.vue'
import Cashier from 'VUE/pages/pafshop/cashier.vue'
import Error from 'VUE/pages/pafshop/error.vue'
import Faq from 'VUE/pages/pafshop/faq.vue'
import Thanks from 'VUE/pages/pafshop/thanks.vue'

Vue.use(VueRouter)

const router = new VueRouter({
    routes: [
        {
            name: 'top'
            , path: '/'
            , component: Top
        }
        
        , {
            name: 'product'
            , path: '/product/:title'
            , component: Product
            , props: true
        }
        
        , {
            name: 'basket'
            , path: '/basket'
            , component: Basket
        } 
        
        , {
            name: 'cashier'
            , path: '/cashier'
            , component: Cashier
        }
        
        , {
            name: 'error'
            , path: '/error'
            , component: Error
        }
        
        , {
            name: 'faq'
            , path: '/faq'
            , component: Faq
        }
        
        , {
            name: 'thanks'
            , path: '/thanks'
            , component: Thanks
        }
      
    ]
})

export default router