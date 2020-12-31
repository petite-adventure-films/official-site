<template>
    <div>
    
        <ArticleHeader
            :breadCrumbs="breadCrumbs"></ArticleHeader>

        <div class="col col_9">
            
            <ul class="list_archives">
                <li
                v-for="item in archiveIndexs"
                :key="`archive${item}`"
                    @click="getArchives(item)"
                    :class="`show_contents tab ${isSelected(item)}`">
                    {{item}}
                </li>
            </ul>
        
            <!-- イベントがないとき -->
            <ul
            v-if="sortedEvents.length > 0"
                class="list_posts list_events">
                <li
                v-for="item in sortedEvents"
                :key="`archive${item.id}`">
                    <CardEvent :item="item"></CardEvent>
                </li>
            </ul>
            
            <!-- イベントがないとき -->
            <div v-else class="m4_t">
                <p>データを準備しています...</p>
            </div>
            
        </div>
        <div class="clear"></div>
        
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
            , archiveIndexs: []
            , thisPageYear: 0
        }
        
    }
    
    , computed:
    {
        ...mapState(['archivedEvents'])
        
        , breadCrumbs()
        {
            return [
                  { name: 'top', title: '上映会・イベント' }
                , { title: this.thisPageYear + '年アーカイブ' }
            ]
        }
        
    }
    
    , methods:
    {
        
        async getArchives(year)
        {
            this.scrollTop();
            this.thisPageYear = year;
            this.sortedEvents = [];
            
            await this.$store.dispatch('getEventsData', {year: year});
            this.sortedEvents = this.$store.state.archivedEvents[year];
        
        }
        
        , isSelected(year)
        {
            return (year == this.thisPageYear) ? '_selected' : '';
        }
        
        ,scrollTop(){
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
        
    }
      
    , created()
    {

        this.thisPageYear = this.$route.params.year || (new Date().getFullYear() - 1);
        this.getArchives(this.thisPageYear)
        
        
        for(let i=(new Date().getFullYear() - 1); i >= 2012; i-- )
        {
            this.archiveIndexs.push(i)
        }
    }
    
}
</script>