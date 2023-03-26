import Vue from 'vue'
import Vuex from 'vuex'
import router from 'JS/router/events.js'

import axios  from 'axios'
Vue.prototype.$http = axios;

Vue.use(Vuex)

const store = new Vuex.Store({

    state:
    {
          events: []
        , archivedEvents: {}
        , films: []
    }
    
    , getters:
    {
        futureEvents: (state) =>
        {
            return state.events.filter(a => new Date(a.custom_fields.events_info_16) >= new Date() || new Date(a.custom_fields.events_info_15) >= new Date());
        }
    }
    
    , mutations:
    {
        setEvents: (state, payload) =>
        {
            
            let _data = Array.isArray(payload.events.data) ? payload.events.data : [payload.events.data];
            _data.forEach(a => {
            
                let index = state.events.findIndex(b => b.id == a.id);
                if(index < 0)
                {
            
                    let data = a;
                    
                    // 映画情報登録
                    data.filmTagsData = [];
                    if(a.filmtags)
                    {
                        a.filmtags.forEach(a2 => {
                            let tag = payload.filmTags.data.find(a3 => a3.id == a2);
                            if(tag)
                            {
                                data.filmTagsData.push(tag.name);
                            }
                        })
                    }
                    
                    //イベント情報登録
                    data.eventTagsData = [];
                    if(a.eventtags)
                    {
                        a.eventtags.forEach(a2 => {
                            let tag = payload.eventTags.data.find(a3 => a3.id == a2);
                            data.eventTagsData.push(tag.name);
                        })
                    }
                    
                    // イベント日付情報登録
                    data.eventDates = [];
                    let startYear  = new Date(a.custom_fields.events_info_15).getFullYear();
                    let startMonth = new Date(a.custom_fields.events_info_15).getMonth();
                    
                    let endYear  = new Date(a.custom_fields.events_info_16).getFullYear();
                    let endMonth = new Date(a.custom_fields.events_info_16).getMonth();
                    
                    let startDate = parseInt(`${startYear}${('0' + (startMonth + 1)).slice(-2)}`);
                    let endDate = parseInt(`${endYear}${('0' + (endMonth + 1)).slice(-2)}`);
                    
                    if(endYear && (endMonth > -1)){
                        for(let i=startDate; i <= endDate; i++)
                        {
                            let m = parseInt(i.toString().slice(-2));
                            if(0 < m && m < 13)
                            {
                                data.eventDates.push(i);
                            }
                        }   
                    }
                    
                    else
                    {
                        data.eventDates.push(startDate);
                    }
                    
                    
                    state.events.push(a);
                    
                    if(state.archivedEvents[startYear] == undefined)
                    {
                        state.archivedEvents[startYear] = [];
                    }
                    state.archivedEvents[startYear].push(a);
                    
                }
                
            })
        
        }
        
        
        , updateEventsData: (state, payload) =>
        {
            let index = state.events.findIndex(a => a.id == payload.id);
            state.events[index].eventDates.push(payload.date);
        }
    }
    
    , actions:
    {
        
        async getEventsData({commit}, payload)
        {
            let filmURI  = `${process.env.SITE_URL}wp-json/wp/v2/filmtags?per_page=100`;
            let eventTagsURI  = `${process.env.SITE_URL}wp-json/wp/v2/eventtags?per_page=100`;
            
            let year = (payload && payload.year) ? payload.year : '';
            let eventURI =  `${process.env.SITE_URL}wp-json/wp/v2/events?per_page=100`;
            if(year)
            {
                eventURI = `${eventURI}&year=${year}`;
            }
            if(payload && payload.pageID)
            {
                eventURI = `${process.env.SITE_URL}wp-json/wp/v2/events/${payload.pageID}`
            }

            await Promise.all([
                  axios.get(eventURI)
                , axios.get(filmURI)
                , axios.get(eventTagsURI)
            ]).then(([events, filmTags, eventTags]) => {
                commit('setEvents', { year, events, filmTags, eventTags });
            })
            
            
        }
        
    }
    
})
export default store