<template>
    <article>
        <cardMedia
        v-for = "post in media"
        :key  = "'media' + post.sys.id"
            :post="post"></cardMedia>
    </article>
</template>


<script>
import { mapState, mapGetters } from 'vuex'
import cardMedia from '@/components/card_media'
import cttfClient from '@/plugins/contentful'

export default {

    components:{
        cardMedia
    }

    , computed: {
        ...mapState(['media'])
        , ...mapGetters(['linkTo', 'dateFormat'])

        , addBreads: function(){
            return [
                {
                    icon: 'mdi-folder-outline'
                    , text: 'メディア紹介'
                    , to: {name: 'media'}
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
            || (store.state.media.length > 0)
                ? store.state.media
                : await cttfClient.getEntries({
                    content_type: 'media'
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