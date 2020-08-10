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
				{{post.fields.relatedSeries.fields.title}}
			</v-chip>
		</header>



		<div v-html="renderRichText(post.fields.body)"></div>

		<div>作成 {{dateFormat(post.fields.publishedDate || post.sys.createdAt)}}</div>

		<br>

		<v-chip v-if="this.post.fields.relatedSeries">#{{this.post.fields.relatedSeries.fields.title}}</v-chip>記事一覧
		<div
		v-for = "(post, key) in relatedSeriesPosts"
		:key = "key"
			><cardPost :post="post"></cardPost>
		</div>

		<v-card
		v-if = "post.fields.relatedEvent"
		:to  = "linkTo('event', post.fields.relatedEvent)"
			outlined
			><v-card-text>
				<v-chip v-if="post.fields.relatedEvent.fields.eventType">
					{{post.fields.relatedEvent.fields.eventType.fields.title}}
				</v-chip>
				<v-chip v-if="post.fields.relatedEvent.fields.relatedFilm">
					{{post.fields.relatedEvent.fields.relatedFilm.fields.titleAbbr}}
				</v-chip>
			</v-card-text>
			<v-card-title>
				<div>{{post.fields.relatedEvent.fields.title}}</div>
			</v-card-title>
			<v-card-text class="text--primary">
				<div>
					{{post.fields.relatedEvent.fields.startDate}}
					<span v-if="post.fields.relatedEvent.fields.endDate">
						~ {{post.fields.relatedEvent.fields.endDate}}
					</span>
				</div>
				<div>
					{{post.fields.relatedEvent.fields.place}}<br>
					{{post.fields.relatedEvent.fields.address}}
				</div>
			</v-card-text>
		</v-card>

		<br><br>

		<nuxt-link :to="{name:'blog'}">←かわら版</nuxt-link><br>
		<nuxt-link :to="{name:'index'}">←HOME</nuxt-link>
	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { createClient } from '@/plugins/contentful'

import cardPost from '@/components/card_post'

const client = createClient();

export default {

	async asyncData({ payload, store, params, error }) {
		const post = payload
			|| await store.state.post.find(post => post.fields.slug === params.slug)
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

	, async created()
	{
		if(this.post.fields.relatedSeries){
			let result = await client.getEntries({
				  content_type: 'post'
				, 'fields.relatedSeries.sys.contentType.sys.id': 'series'
				, 'fields.relatedSeries.fields.title[match]': this.post.fields.relatedSeries.fields.title,
			});
			this.relatedSeriesPosts = result.items;
		}
	}

}
</script>