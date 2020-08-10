<template>
	<div>
		<h1>{{post.fields.title}}</h1>
		<div v-html="renderRichText(post.fields.body)"></div>
		<nuxt-link :to="{name:'index'}">←HOME</nuxt-link>
	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

import { createClient } from '@/plugins/contentful'

const client = createClient();

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

	// 記事取得
	, async asyncData({ payload, store, params, error }){

		const result = payload
			|| await client.getEntries({
				  content_type: 'page'
				, 'fields.slug' : 'gathering-the-personal-information'
			});

		if (result) {

			let fetchedPosts;

			if(result.items)
			{
				return { post: result.items[0] }
			}

			else
			{
				fetchedPosts = result;
				return { fetchedPosts }
			}


		} else {
			return error({ statusCode: 400 })
		}
	}

}
</script>