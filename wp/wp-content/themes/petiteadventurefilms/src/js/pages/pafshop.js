import Vue    from 'vue'
import router from 'JS/router/pafshop.js'
import store  from 'JS/store/pafshop.js'

import axios  from 'axios'
Vue.prototype.$http = axios

import modal from 'VUE/components/pafshop_modal.vue'
import modal_payment from 'VUE/components/pafshop_modal_payment.vue'

new Vue({
    
    el: '#app'
    , components: { modal, modal_payment }
    , router
    , store
    
    , data:
    {
    
        modalCheckBasket: false
        
        , modalDeleteItem: false
        , toDeleteItem: null
        , toDeleteItemKey: null
        
        , modalPayment: false
    }
    
    , computed:
    {
        basketsCount()
        {
           return this.$store.state.basketsCount;
        }
    }
    
    , methods:
    {
        //
        confirmDeleteItem(data, key)
        {
            this.modalDeleteItem = true;
            this.toDeleteItem = data;
            this.toDeleteItemKey = key;
        }
        , deleteItem()
        {
        
            let key = this.toDeleteItemKey;
            this.toDeleteItem.basket.unit[key] = 0;
            let type = this.toDeleteItem.basket.type[key];
            if(type != 999)
            {
                this.toDeleteItem.basket.type[key] = 0;
            }
            
            this.$store.commit('updateBasket', this.toDeleteItem.basket);
            this.$store.commit('updateBasketCount');
            
            this.toDeleteItem = null;
            this.toDeleteItemKey = null;
            this.modalDeleteItem = false;
        }
        
    }
    
    , mounted()
    {
        this.$store.commit('updateBasketCount')
    }
    
    , async created()
    {
        this.$store.dispatch('getPafshopData');
    }
    
});
