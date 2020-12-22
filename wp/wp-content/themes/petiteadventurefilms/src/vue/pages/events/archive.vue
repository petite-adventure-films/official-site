<template>
    <div>
    
        <div v-for="item in archiveEvents" :key="`archive${item.id}`">
            {{item.title.rendered}}
        </div>
        
    </div>
</template>
<script>

import { mapState, mapGetters } from 'vuex'
import Vue from 'vue'

import axios  from 'axios'
Vue.prototype.$http = axios;


export default {
    
    data()
    {
        return{
            archiveEvents: []
        }
        
    }
    
    ,methods:
    {
    }
    
    , mounted()
    {
    }
        
    , async created()
    {
        const eventsURI = `${process.env.SITE_URL}wp-json/wp/v2/events?per_page=50&year=${this.$route.params.year}`;
        const response = await Promise.all([
            axios.get(eventsURI)
        ]).then(([events]) => {
            this.archiveEvents  = events.data
        })
        
    }
    
}
</script>