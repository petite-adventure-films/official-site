<template>
    <router-link
    :to="{ name: 'event', params: { id: item.id  } }">
        <h2>
            <span class="block caption2">No.{{item.postNo}}</span>
            <span v-if="item.custom_fields.events_info_18" class="inline-block body1 label_status">{{status[item.custom_fields.events_info_18]}}</span>
            {{item.title.rendered}}
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

export default {
    props: ['item']
    
    , data()
    {
        return{
            status: {1 :'延期', 2:'中止'}
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
    
}
</script>