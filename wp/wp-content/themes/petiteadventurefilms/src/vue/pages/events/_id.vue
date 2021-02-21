<template>
    <div>
           
        <ArticleHeader
            :breadCrumbs="breadCrumbs"
            :labels="labels"></ArticleHeader>
            
        <div class="col col_9 lastぎ">
            <ul class="list_events_info">
            
                <li class="index place">
                    {{info.events_info_01}}
                    <span class="inline-block">
                        <span v-if="info.events_info_02"> : {{info.events_info_02}}</span>
                        <a
                        v-if="info.events_info_03"
                            :href="info.events_info_03" target="_blank">
                            MAP
                        </a>
                    </span>
                </li>
                
                <li v-if="info.events_info_04" class="index flag"><div v-html="info.events_info_04"></div></li>
                
                <li v-if="info.events_info_09" class="index date"><div v-html="info.events_info_09"></div></li>
                
                <li v-if="info.events_info_13" class="index fee"><div v-html="info.events_info_13"></div></li>
                
                <li v-if="info.events_info_14" class="index group"><div v-html="info.events_info_14"></div></li>
                
                <li v-if="info.events_info_06" class="index appendix"><div v-html="info.events_info_06"></div></li>
                
            </ul>    
            <time
            :datetime="postedDate"
            class="block m7_t caption1 list_post_time">{{postedDate}}掲載</time>
        </div>
        
    </div>
</template>
<script>

import { mapState, mapGetters } from 'vuex'
import Vue from 'vue'

import VueMeta from 'vue-meta'
Vue.use(VueMeta)

import axios  from 'axios'
Vue.prototype.$http = axios;

import ArticleHeader from 'VUE/components/article_header.vue'

export default {

    components: { ArticleHeader }
    
    , data()
    {
        return{
              title: ''
            , item: {}
            , info: {}
            , filmData: []
            , postedDate: ''
            , isArchive: false
            , archiveYear: 0
            , status: {1 :'延期', 2:'中止'}
        }
        
    }
    
    , computed:
    {
    
        ...mapState(['events'])
        
        , breadCrumbs()
        {
        
            let arr = [
                  { name: 'top', title: '上映会・イベント' }
                , { title: this.title }
            ];
            
            if(this.isArchive)
            {
                let _arr = [{ name: 'archive', title: `${this.archiveYear}年アーカイブ`, year: this.archiveYear }];
                Array.prototype.splice.apply(arr, [1,0].concat(_arr))
            }
            
            return arr;
        }
        
        , labels()
        {
            let arr = [];
            
            if(this.info.events_info_18)
            {
                arr.push({class: 'status', label: this.status[this.info.events_info_18]})
            }
            
            if(this.item.eventTagsData)
            {
                this.item.eventTagsData.forEach(a => arr.push({ class: 'eventtag', label: a }))
            }
            
            if(this.item.filmTagsData)
            {
                this.item.filmTagsData.forEach(a => arr.push({ class: 'filmtag', label: a }))
            }
        
            return arr;
        }
        
    }
    
    ,methods:
    {
        setEventData(index)
        {
            this.item       = this.events[index];   
            this.info       = this.item.custom_fields;
            this.title      = this.item.title.rendered;
            this.filmData   = this.item.filmData;
            this.postedDate = new Date(this.item.date).toLocaleString('ja-JP', {year: 'numeric', month: '2-digit', day: '2-digit'})
        }
    }
    
    , mounted()
    {
    }
        
    , async created()
    {
        
        let index = this.$store.state.events.findIndex(a => a.id == this.$route.params.id);
        if(index > 0)
        {
            this.setEventData(index);
        }
        else
        {
            await this.$store.dispatch('getEventsData', { pageID: this.$route.params.id });
            let _index = this.$store.state.events.findIndex(a => a.id == this.$route.params.id);
            this.setEventData(_index);
        }
        
        this.isArchive = Math.min(...this.item.eventDates) < parseInt(new Date().getFullYear() * 100);
        this.archiveYear = Math.max(...this.item.eventDates).toString().slice(0, 4);
        
    }
    
    , metaInfo()
    {
        return {
              title: `${this.title} | ${process.env.SITE_NAME}`
        }
    }
    
}
</script>