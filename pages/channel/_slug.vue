<template>
    <article>

        {{fields.title}}
        <v-chip v-if="fields.eventType">
            {{fields.eventType.fields.title}}
        </v-chip>
        <v-chip v-if="fields.relatedFilm">
            {{fields.relatedFilm.fields.titleAbbr}}
        </v-chip>

        <youtube :video-id="fields.youtubeVideoId"></youtube>
        <div>{{fields.country}} / {{fields.releaseYear}} / {{fields.runningTime}}</div>

        <br>
        <div v-html="renderRichText(fields.body)"></div>

        <div v-if="fields.relatedBlogPost">
            関連記事
            <cardPost :post="fields.relatedBlogPost"></cardPost>
        </div>

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

    , computed: {
        ...mapGetters(['linkTo', 'dateFormat', 'renderRichText'])
        , fields: function(){ return this.post.fields || {} }
        , sys: function(){ return this.post.sys || {} }
        , addBreads: function(){
            return [
                {
                      icon: 'mdi-folder-outline'
                    , text: 'チャンネル'
                    , to: { name: 'channel'}
                }
                , {
                    text: this.post.fields.title
                    , to: this.linkTo('channel', this.post)
                }
            ]
        }
    }

    
    , async asyncData({ payload, store, params, error }) {
        const post = await store.state.video.find(post => post.fields.slug === params.slug)
            || await cttfClient.getEntries({
                  content_type: 'video'
                , 'fields.slug' : params.slug
            });

        if (post) {
            return { post: post.items ? post.items[0] : post }
        } else {
            return error({ statusCode: 400 })
        }
    }

}
</script>