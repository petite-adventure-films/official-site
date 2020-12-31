import Vue    from 'vue'
import router from 'JS/router/events.js'
import store  from 'JS/store/events.js'

import axios  from 'axios'
Vue.prototype.$http = axios;

new Vue({
    
    el: '#app'
    , components: {}
    , router
    , store
    
    , data:
    {
        
    }
    
    
});
