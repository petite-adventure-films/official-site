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
    }
    
    , getters:
    {
    }
    
    , mutations:
    {
        setEvents: (state, payload) =>
        {
            payload.events.data.forEach(a => {
                a.eventDates = [];
                state.events.push(a)
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
        
        async getEventsData({commit})
        {
            const eventURI = `${process.env.SITE_URL}wp-json/wp/v2/events?per_page=50`;
            await Promise.all([
                  axios.get(eventURI)
            ]).then(([events]) => {
                commit('setEvents', { events });
            })
            
        }
        
    }
    
})
export default store