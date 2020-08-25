<template>
    <article>
        <h3>{{fields.title}}</h3>
        <v-chip v-if="fields.category">
            {{fields.category.fields.title}}
        </v-chip>
        <v-chip v-if="fields.relatedFilm">
            {{fields.relatedFilm.fields.titleAbbr}}
        </v-chip>
        <v-chip v-if="fields.relatedSeries">
            #{{fields.relatedSeries.fields.title}}
        </v-chip>

        <div class="event_info" v-if="fields.relatedEvent">
			<h4>イベント情報</h4>
			{{fields.relatedEvent.fields.place}}<br>
			{{dateFormat(fields.relatedEvent.fields.startDate)}}
			<span v-if="fields.relatedEvent.fields.endDate">
			 ~ {{dateFormat(fields.relatedEvent.fields.endDate)}}
			</span><br>
			{{fields.relatedEvent.fields.organizer}}<br>
		</div>

		<div v-html="renderRichText(fields.body)"></div>

		<div>作成 {{dateFormat(fields.publishedDate || post.sys.createdAt)}}</div>

		<br>

		<div v-if="fields.relatedSeries">
			<v-chip>#{{fields.relatedSeries.fields.title}}</v-chip>記事一覧
			<div
			v-for = "post in relatedSeriesPosts"
			:key = "'relatedSeriesPosts' + post.sys.id"
				><cardPost :post="post"></cardPost>
			</div>
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

    , data: function()
    {
        return{
            relatedSeriesPosts : []
        }
    }

    , computed: {
        ...mapGetters(['linkTo', 'dateFormat', 'renderRichText'])
        , fields: function(){ return (this.post) ? this.post.fields : {} }
        , sys: function(){ return (this.post) ? this.post.sys : {} }
        , addBreads: function(){
            return [
                {
                      icon: 'mdi-folder-outline'
                    , text: 'かわら版'
                    , to: { name: 'post'}
                }
                , {
                    text: this.post.fields.title
                    , to: this.linkTo('post', this.post)
                }
            ]
        }

    }

    , methods: {

    }

    , async created()
    {
        if(this.post.fields.relatedSeries){
            let result = await cttfClient.getEntries({
                  content_type: 'post'
                , order: 'fields.publishedDate,fields.order,sys.createdAt'
                , 'fields.relatedSeries.sys.contentType.sys.id': 'series'
                , 'fields.relatedSeries.fields.title[match]': this.post.fields.relatedSeries.fields.title,
            });
            if(result)
            {
                this.relatedSeriesPosts = result.items || {};
            }
        }
    }

    , async asyncData({ payload, store, params, error }) {

        const post = await store.state.post.find(post => post.fields.slug === params.slug)
            || await cttfClient.getEntries({
                  content_type: 'post'
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