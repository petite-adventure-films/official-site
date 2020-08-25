<template>
    <article>
        かわら版 - {{pageTitle}}

        <cardPost
        v-for="item in post"
        :key="'recommendPost' + item.sys.id"
            :post="item"></cardPost>
        <br>

    </article>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import cttfClient from '@/plugins/contentful'

import cardPost from '@/components/card_post'

export default {

    components:{
        cardPost
    }

    , data: function()
    {
        return{
            pageTitle : this.$route.params.slug
        }
    }

    , computed:
    {
        ...mapState(['category', 'series'])
        , ...mapGetters(['linkTo', 'dateFormat'])
        , addBreads: function(){
            return [
                {
                    icon: 'mdi-folder-outline'
                    , text: 'かわら版'
                    , to: {name: 'blog'}
                }
                , {
                    icon: 'mdi-folder-outline'
                    , text: this.$route.params.slug
                    , to: {name: 'serise', params: { slug: this.$route.params.slug } }
                }
            ]
        }
    }

    , async asyncData({ payload, store, params, error }) {
        const post = payload ||
            await cttfClient.getEntries({
                  content_type: 'post'
                , limit: 20
                , order: '-fields.publishedDate,-fields.order,-sys.createdAt'
                , 'fields.relatedSeries.sys.contentType.sys.id': 'series'
                , 'fields.relatedSeries.fields.title[match]': params.slug
            });

        if (post) {
            return { post: post.items ? post.items : post }

        } else {
            return error({ statusCode: 400 })
        }
    }
    
}
</script>