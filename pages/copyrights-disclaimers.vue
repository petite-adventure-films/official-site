<template>
    <div>
        <h1>{{post.fields.title}}</h1>
        <div v-html="renderRichText(post.fields.body)"></div>
        <nuxt-link :to="{name:'index'}">←HOME</nuxt-link>
    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import cttfClient from '@/plugins/contentful'

export default {

    data: function()
    {
        return{
            sortedPosts   : []
            , skipped: 0
        }
    }

    , computed:
    {
        ...mapGetters(['linkTo', 'dateFormat', 'renderRichText'])
    }

    , methods:
    {
    }


    , created: function()
    {
    }

    , async asyncData({ payload, store, params, error }){

        const result = payload
            || await cttfClient.getEntries({
                  content_type: 'page'
                , 'fields.slug' : 'copyrights-disclaimers'
            });

        if (result) {
            return { post: result.items[0] }


        } else {
            return error({ statusCode: 400 })
        }
    }


}
</script>