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
        // this.events
        futureEvents: (state) =>
        {
            let thisYear  = new Date().getFullYear().toString();
            let thisMonth = ('0' + (new Date().getMonth() + 1)).slice(-2);
            return state.events.filter(a => Math.max(...a.eventDates) > parseInt(thisYear + thisMonth));
        }
    }
    
    , mutations:
    {
        setEvents: (state, payload) =>
        {
            
            let _data = Array.isArray(payload.events.data) ? payload.events.data : [payload.events.data];
            _data.forEach(a => {
            
                if(state.events.findIndex(b => b.id == a.id) < 0)
                {
            
                    let data = a;
                    data.eventDates = [];
                    
                    // 映画情報登録
                    let filmdata = payload.films.data.filter(a2 => a.filmtags.indexOf(a2.filmtags[0]) > -1);
                    data.filmData = filmdata;
                
                    // イベント日付情報登録
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
        
        , setFilms: (state, payload) =>
        {
            state.films = payload.films.data;
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
            const filmURI  = `${process.env.SITE_URL}wp-json/wp/v2/films`;
            
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
            
            
            //     let eventURI = ;
            await Promise.all([
                  axios.get(eventURI)
                , axios.get(filmURI)
            ]).then(([events, films]) => {
                commit('setEvents', { year, events, films });
            })
            
            
        }
        
    }
    
})
export default store