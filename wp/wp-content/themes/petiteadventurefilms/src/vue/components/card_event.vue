<template>
    <router-link
    :to="{ name: 'event', params: { id: item.id  } }">
        <h2>
            <div class="block caption2">No.{{postNo}}</div>
            <span class="inline-block labels">
                <span v-if="item.custom_fields.events_info_18" class="inline-block body1 label _status">{{status[item.custom_fields.events_info_18]}}</span>
                <span v-for="data in item.eventTagsData" :key="`event${item.id}${data}`" class="inline-block body1 label _eventtag">{{data}}</span>
            </span>
            <span class="inline-block title">{{item.title.rendered}}</span>
        </h2>
        <ul class="list_post_info">
            <li class="index date">
                {{item.custom_fields.events_info_15}}
                <span v-if="item.custom_fields.events_info_16">
                        - {{item.custom_fields.events_info_16}}
                </span>
            </li>
            <li class="index place">
                {{item.custom_fields.events_info_01}}
                : {{item.custom_fields.events_info_02}}
            </li>
            <li v-if="filmTitle" class="index label">
                {{filmTitle}}
            </li>
        </ul>
    </router-link>
</template>
<script>
import Vue from 'vue'
import axios  from 'axios'
Vue.prototype.$http = axios;

export default {
    props: ['item']
    
    , data()
    {
        return{
            postNo : ''
            , status: {1 :'延期', 2:'中止'}
        }
    }
    , computed:{
        filmTitle()
        {
            return this.item.filmData && this.item.filmData.length > 0
                 ? this.item.filmData[0].title.rendered
                 : false;
        }
    }
    
    , async created()
    {
        const postURI  = `${process.env.SITE_URL}wp-json/wp/custom/get_event_number?pageID=${this.item.id}`;
        await axios.get(postURI).then(res => this.postNo = res.data);
                    
    }
    
}
</script>