<template>
    <article>
        <cardVideo
        v-for = "post in video"
        :key  = "'video'+post.sys.id"
            :post="post"></cardVideo>
    </article>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import cardVideo from '@/components/card_video'
import cttfClient from '@/plugins/contentful'

export default {

    components:{
        cardVideo
    }

    , computed: {
        ...mapState(['video'])
        , ...mapGetters(['linkTo', 'dateFormat'])

        , addBreads: function(){
            return [
                {
                    icon: 'mdi-folder-outline'
                    , text: 'チャンネル'
                    , to: {name: 'channel'}
                }
            ]
        }

    }

    , methods: {
    }

    , created: function()
    {
    }
    
    , async asyncData({ payload, store, params, error }) {

        const result = payload 
            || (store.state.video.length > 0)
                ? store.state.video
                : await cttfClient.getEntries({
                    content_type: 'video'
                    , order: '-fields.publishedDate,-sys.createdAt'
                    , limit: 20
                });

        if (result) {

            if(result.items)
            {
                store.commit('setPosts', result)
                store.commit('setPageInfo', result)

            }
            
        } else {
            return error({ statusCode: 400 })
        }
    }

}
</script>