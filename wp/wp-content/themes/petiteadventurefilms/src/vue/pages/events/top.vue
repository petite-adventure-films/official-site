<template>
    <div>
    
        <ArticleHeader
            :breadCrumbs="breadCrumbs"></ArticleHeader>
    
        <div class="m4_t">
            <div class="col col_9">
                <ul class="list_archives">
                    <li class="show_contents tab" @click="displayEvents()">最新</li>
                    <li v-for="(months, year) in dateIndexs" :key="`index${year}`">
                        {{year}}
                        <div
                        v-for="month in months"
                        :key="`index${year}${month}`"
                            @click="displayEvents(year, month)"
                            class="show_contents tab">
                            {{month}}
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        <div class="clear"></div>
        
        <div class="col col_9">
            <ul class="list_posts list_events">
                <li
                v-for="item in sortedEvents"
                :key="`event${item.id}`">
                    <CardEvent :item="item"></CardEvent>
                </li>
            </ul>
        </div>
        <div class="clear"></div>
        
         <!-- <div class="col col_9 last">
        <section class="tab_contents" id="tab_latest">
            <?php echo get_events($now, TRUE); ?>
        </section>
        <?php if(!empty($months)):
        foreach($months as $month): ?>
            <section class="tab_contents" id="tab_<?php echo $month["slug"]; ?>">
            <?php echo get_events($month["slug"]); ?>
            </section>
        <?php endforeach; endif; ?>
    </div> -->
        
        <div v-for="item in archiveIndexs" :key="`archive${item}`">
            <router-link :to="{ name: 'archive', params: { year: item } }">{{item}}</router-link>
        </div>
        
    </div>
</template>
<script>
import { mapState, mapGetters } from 'vuex'
import Vue from 'vue'

import ArticleHeader from 'VUE/components/article_header.vue'
import CardEvent from 'VUE/components/card_event.vue'

import axios  from 'axios'
Vue.prototype.$http = axios;

export default {

    components: { ArticleHeader, CardEvent }
    
    , data()
    {
        return{
            dateIndexs: {}
            , archiveIndexs: []
            , sortedEvents: []
        }
        
    }
    , computed:
    {
        ...mapState(['events'])
        
        , breadCrumbs()
        {

            return [
                  { name: 'top', title: '上映会・イベント' }
            ]
        }
    }
    
    ,methods:
    {
        displayEvents(year, month)
        {
            if(year && month)
            {
                this.sortedEvents = this.events.filter(a => a.eventDates.includes(parseInt(`${year}${month}`)))
            }
            else
            {
                this.sortedEvents = this.events;
            }
        }
    }
    
    , mounted()
    {
    }
        
    , async created()
    {
    
    
    
        // console.log('comes?')
        // const eventURI = `${process.env.SITE_URL}wp-json/wp/v2/events?per_page=100&date=2020/12/20`;
        // await axios.get(eventURI).then(events => {
        //     console.log('event', events)
        // })
    

        if(this.$store.state.events.length === 0)
        {
            await this.$store.dispatch('getEventsData');
        }
        
        // this.sortedEvents = this.$store.state.events;
        
        // let dateIndexs = [];
        // this.$store.state.events.forEach(a => {
        
        //     a.eventDates = [];
            
        //     let startYear  = new Date(a.custom_fields.events_info_15).getFullYear();
        //     let startMonth = new Date(a.custom_fields.events_info_15).getMonth();
            
        //     let endYear = new Date(a.custom_fields.events_info_16).getFullYear();
        //     let endMonth = new Date(a.custom_fields.events_info_16).getMonth();
            
        //     let startDate = parseInt(`${startYear}${('0' + (startMonth + 1)).slice(-2)}`);
        //     let endDate = parseInt(`${endYear}${('0' + (endMonth + 1)).slice(-2)}`);
            
            
        //     if(endYear && endMonth){
        //         for(let i=startDate; i <= endDate; i++)
        //         {
        //             this.$store.commit('updateEventsData', {id: a.id, date: i});
        //             dateIndexs.push(i);
        //         }
        //     }
            
        //     else
        //     {
        //         this.$store.commit('updateEventsData', {id: a.id, date: startDate});
        //         dateIndexs.push(startDate);
        //     }
            
        // });
        
        
        // let indexs = {}
        // dateIndexs = dateIndexs.filter(function (x, i, self) {
        //     return self.indexOf(x) === i;
        // });
        // dateIndexs = dateIndexs.sort().forEach(a => {
        //     let year = a.toString().slice(0, 4);
        //     let month = a.toString().slice(-2);
        //     if(indexs[year] == undefined)
        //     {
        //         indexs[year] = [];
        //     }
        //     indexs[year].push(month);
        // }) 
        // this.dateIndexs = indexs;
        
        // for(let i=(new Date().getFullYear() - 1); i >= 2012; i-- )
        // {
        //     this.archiveIndexs.push(i)
        // }
        
        
        
    }
    
}
</script>