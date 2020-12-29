<template>
    <div>
    
        <ArticleHeader
            :breadCrumbs="breadCrumbs"></ArticleHeader>

        <div class="col col_9">
            <ul class="list_posts list_events">
                <li
                v-for="item in sortedEvents"
                :key="`archive${item.id}`">
                    <CardEvent :item="item"></CardEvent>
                </li>
            </ul>
        </div>
        
    </div>
</template>
<script>

import { mapState, mapGetters } from 'vuex'
import Vue from 'vue'

import axios  from 'axios'
Vue.prototype.$http = axios;

import ArticleHeader from 'VUE/components/article_header.vue'
import CardEvent from 'VUE/components/card_event.vue'

export default {
    
    components: { ArticleHeader, CardEvent }
    
    , data()
    {
        return{
            sortedEvents: []
        }
        
    }
    
    , computed:
    {
        ...mapState(['archivedEvents'])
        
        , breadCrumbs()
        {
            return [
                  { name: 'top', title: '上映会・イベント' }
                , { title: this.$route.params.year + '年アーカイブ' }
            ]
        }
        
    }
      
    , async created()
    {
        let thisPageYear = this.$route.params.year;
        await this.$store.dispatch('getEventsData', {year: thisPageYear});
        this.sortedEvents = this.$store.state.archivedEvents[thisPageYear]    
    }
    
}
</script>