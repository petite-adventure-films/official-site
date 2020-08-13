<template>
	<div>

		<header>
			<breadcrumbs :addItems="addBreads"></breadcrumbs>
				<h3>{{ post.fields.title }}</h3>
			<v-chip v-if="post.fields.category">
				{{post.fields.category.fields.title}}
			</v-chip>
			<v-chip v-if="post.fields.relatedFilm">
				{{post.fields.relatedFilm.fields.titleAbbr}}
			</v-chip>
			<v-chip v-if="post.fields.relatedSeries">
				#{{post.fields.relatedSeries.fields.title}}
			</v-chip>
		</header>

		<div class="event_info" v-if="post.fields.relatedEvent">
			<h4>イベント情報</h4>
			{{post.fields.relatedEvent.fields.place}}<br>
			{{dateFormat(post.fields.relatedEvent.fields.startDate)}}
			<span v-if="post.fields.relatedEvent.fields.endDate">
			 ~ {{dateFormat(post.fields.relatedEvent.fields.endDate)}}
			</span><br>
			{{post.fields.relatedEvent.fields.organizer}}<br>
		</div>

		<div v-html="renderRichText(post.fields.body)"></div>

		<div>作成 {{dateFormat(post.fields.publishedDate || post.sys.createdAt)}}</div>

		<br>

		<div v-if="this.post.fields.relatedSeries">
			<v-chip>#{{this.post.fields.relatedSeries.fields.title}}</v-chip>記事一覧
			<div
			v-for = "(post, key) in relatedSeriesPosts"
			:key = "post.sys.id"
				><cardPost :post="post"></cardPost>
			</div>
		</div>

	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { createClient } from '@/plugins/contentful'

import cardPost from '@/components/card_post'

const client = createClient();

export default {

	async asyncData({ payload, store, params, error }) {

		const post = await store.state.post.find(post => post.fields.slug === params.slug)
			|| await client.getEntries({
				  content_type: 'post'
				, 'fields.slug' : params.slug
			});

		if (post) {
			return { post: post.items ? post.items[0] : post }
		} else {
			return error({ statusCode: 400 })
		}
	}

	, components:{
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

		,addBreads: function(){
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
			let result = await client.getEntries({
				  content_type: 'post'
				, order: 'fields.publishedDate,fields.order,sys.createdAt'
				, 'fields.relatedSeries.sys.contentType.sys.id': 'series'
				, 'fields.relatedSeries.fields.title[match]': this.post.fields.relatedSeries.fields.title,
			});
			this.relatedSeriesPosts = result.items;
		}
	}

}
</script>

<style>
	blockquote{
		padding-left: 1em;
		border-left: 4px solid #eeeeee;
	}
	img{
		min-width: 640px;
	}
	a[target='_blank']:after{
		content: '↗︎';
	}
	hr{
		margin-bottom: 1em;
		border: none;
		border-top: 1px solid #dddddd;
	}

	.card-post{
		border: 1px solid #dddddd;
		border-radius: 8px;
		padding: 8px;
		margin-bottom: 1em;
	}

	.event_info{
		margin-top: 1em;
		margin-bottom: 1em;
		padding: 8px;
		border: 1px solid #dddddd;
		border-radius: 8px;
	}
</style>