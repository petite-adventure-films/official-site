<template>
	<article>
		<header>
			<breadcrumbs :addItems="addBreads"></breadcrumbs>
			<h1>かわら版 - {{pageTitle}}</h1>
		</header>

		<div
		v-for = "item in post"
		:key = "item.sys.id"
			><cardPost :post="item"></cardPost>
		</div>
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
				, 'fields.recommendation': true
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
			pageTitle : 'おすすめ'
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
					, text: 'おすすめ'
					, to: {name: 'serise-recommend'}
				}
			]
		}
	}

	, methods:
	{
	}

}
</script>