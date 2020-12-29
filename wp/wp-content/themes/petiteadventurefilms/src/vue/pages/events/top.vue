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
        
            <!-- イベントがあるとき -->
            <ul
            v-if="sortedEvents.length > 0"
            class="list_posts list_events">
                <li
                v-for="item in sortedEvents"
                :key="`event${item.id}`">
                    <CardEvent :item="item"></CardEvent>
                </li>
            </ul>
            
            <!-- イベントがないとき -->
            <div v-else class="m4_t">
                <p>ただ今、予定の上映会・イベントがありません。</p>
            </div>
        
            <aside class="contents m4_t">
                <h3>過去のイベントはこちらから</h3>
                <ul class="list_archives m1_t">
                    <li class="show_contents" v-for="item in archiveIndexs" :key="`archive${item}`">
                        <router-link :to="{ name: 'archive', params: { year: item } }">{{item}}</router-link>
                    </li>
                </ul>
            </aside>

        </div>
        <div class="clear"></div>
        
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
            , selectedYear: 0
            , selectedMonth: 0
        }
        
    }
    , computed:
    {
        ...mapState(['events'])
        , ...mapGetters(['futureEvents'])
        
        , breadCrumbs()
        {
            return [
                  { name: 'top', title: '上映会・イベント' }
            ]
        }
        
        , sortedEvents()
        {
            return (this.selectedYear && this.selectedMonth)
                ? this.events.filter(a => a.eventDates.includes(parseInt(`${this.selectedYear}${this.selectedMonth}`)))
                : this.futureEvents;
        }
    }
    
    ,methods:
    {
        displayEvents(year, month)
        {
            this.selectedYear  = (year) ? year : 0;
            this.selectedMonth = (month) ? month : 0;
        }
    }
    
    , mounted()
    {
    }
        
    , async created()
    {    

        await this.$store.dispatch('getEventsData');
        
        let dateIndexs = [];
        this.$store.state.events.forEach(a => {
            a.eventDates.forEach(a2 => {
                dateIndexs.push(a2)
            })
        })
        let indexs = {}
        dateIndexs = dateIndexs.filter(function (x, i, self) {
            return self.indexOf(x) === i;
        });
        dateIndexs = dateIndexs.sort().forEach(a => {
            if(a > (new Date().getFullYear() * 100))
            {
                let year = a.toString().slice(0, 4);
                let month = a.toString().slice(-2);
                if(indexs[year] == undefined)
                {
                    indexs[year] = [];
                }
                indexs[year].push(month);
            }
        }) 
        this.dateIndexs = indexs;
        
        for(let i=(new Date().getFullYear() - 1); i >= 2012; i-- )
        {
            this.archiveIndexs.push(i)
        }
        
        
    }
    
}
</script>