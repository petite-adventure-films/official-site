<template>
    <div>
    
            
        <ArticleHeader
            :breadCrumbs="breadCrumbs"
            :labels="labels"></ArticleHeader>
            
        <div class="col col_9 lastぎ">
            <ul
            v-if="filmData.length > 0"
            class="list_post_info">
                <li>
                    <span
                    v-for="film in filmData"
                    :key="`film${film.id}`"
                        class="inline_block index film">{{film.title.rendered}}</span>
                </li>
            </ul>
            <ul class="list_events_info">
            
                <li class="index place">
                    {{info.events_info_01}}
                    <span class="inline-block">
                        : {{info.events_info_02}}
                        <a
                        v-if="info.events_info_03"
                            href="info.events_info_03">
                            MAP
                        </a>
                    </span>
                </li>
                
                <li class="index flag">
                    <span v-html="info.events_info_04"></span>
                </li>
                
                <li class="index date">
                    <span v-html="info.events_info_09"></span>
                </li>
                
                <li class="index fee">
                    <span v-html="info.events_info_13"></span>
                </li>
                
                <li class="index appendix">
                    <span v-html="info.events_info_06"></span>
                </li>
                
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
            let arr = [
                //   { class: 'status', label: '延期' }
                // , { class: 'eventtag', label: '上映会' }
            ];
            
            if(this.info.events_info_18)
            {
                arr.push({class: 'status', label: this.status[this.info.events_info_18]})
            }
            
            if(this.item.eventTagsData)
            {
                this.item.eventTagsData.forEach(a => arr.push({ class: 'eventtag', label: a }))
            }
            
            
            
        // <!-- <div class="inline-block labels">
        //     <span v-if="info.events_info_18" class="inline-block body1 label _status">{{}}</span>
        //     <span v-for="data in item.eventTagsData" :key="`event${item.id}${data}`" class="inline-block body1 label _eventtag">{{data}}</span>
        // </div> -->
        
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
        
        
        this.isArchive = Math.min(...this.item.eventDates) < parseInt(202000);
        this.archiveYear = Math.max(...this.item.eventDates).toString().slice(0, 4);
        
    }
    
}
</script>