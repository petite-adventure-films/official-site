<template>
    <div>
        <ArticleHeader
            :breadCrumbs="breadCrumbs"></ArticleHeader>
    </div>
</template>
<script>

import { mapState, mapGetters } from 'vuex'
import Vue from 'vue'

import axios  from 'axios'
Vue.prototype.$http = axios;

import ArticleHeader from 'VUE/components/article_header.vue'

export default {

    components: { ArticleHeader }
    
    , data()
    {
        return{
            title: ''
        }
        
    }
    
    , computed:
    {
    
        breadCrumbs()
        {

            return [
                  { name: 'top', title: 'イベント' }
                , { title: this.title }
            ]
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
        const eventURI = `${process.env.SITE_URL}wp-json/wp/v2/events/${this.$route.params.id}`;
        const response = await axios.get(eventURI).then((event) => {
            this.title = event.data.title.rendered
        })
        
    }
    
}
</script>