<template>
	<article>
		<header>
			<breadcrumbs :addItems="addBreads"></breadcrumbs>
			<h1>かわら版 - {{pageTitle}}</h1>
		</header>

		<br>
		<div
		v-for = "item in category"
		:key = "item.sys.id"
			><v-btn outlined class="mt-1" :to = "linkTo('category', item)">{{item.fields.title}}</v-btn>
		</div>
		<br>
		<div
		v-for = "item in series"
		:key = "item.sys.id"
			><v-btn outlined class="mt-1" :to = "linkTo('series', item)">{{item.fields.title}}</v-btn>
		</div>
		<br>
		<div
		v-for = "item in post"
		:key = "item.sys.id"
			><cardPost :post="item"></cardPost>
		</div>
		<br><br>
		<nuxt-link :to="{name:'index'}">←HOME</nuxt-link>
	</article>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { createClient } from '@/plugins/contentful'

import cardPost from '@/components/card_post'

const client = createClient();

export default {

	async asyncData({ payload, store, params, error }) {
		const post = await client.getEntries({
				  content_type: 'post'
				, limit: 20
				, order: '-fields.publishedDate,-fields.order,-sys.createdAt'
				, 'fields.relatedSeries.sys.contentType.sys.id': 'series'
				, 'fields.relatedSeries.fields.title[match]': params.slug
			});

		if (post) {
			return {
				post: post.items ? post.items : post
			}

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

	, methods:
	{
	}

}
</script>