<template>
	<div>
		<h1>メディア紹介</h1>
		<br><br>
		<div
		v-for = "post in sortedPosts"
		:key  = "post.key"
			><cardMedia :post="post.data"></cardMedia>
		</div>
		<br><br>
		<nuxt-link :to="{name:'index'}">←HOME</nuxt-link>
	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { createClient } from '@/plugins/contentful'

import cardMedia from '@/components/card_media'

const client = createClient();

export default {

	components:{
		cardMedia
	}

	, head()
	{
		return {
			script: [ { src: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.4.456/build/pdf.min.js', body: true } ]
		}
	}

	, computed: {
		...mapGetters(['linkTo', 'dateFormat'])
	}

	, methods: {

		sort: function(data)
		{
			let arr = Object.keys(data).map((e) => ({
				  key: e
				, sorted : data[e].fields.order || data[e].sys.createdAt
				, data   : data[e]
			}));
			return arr.sort((a, b) => a.sorted < b.sorted ? 1 : -1);
		}

	}

	, created: function()
	{
		this.sortedPosts = this.sort(this.fetchedPosts);
	}

	// 記事取得
	, async asyncData({ payload, store, params, error }){

		const result = payload
			|| store.state.media.length ? store.state.media : false
			|| await client.getEntries({
				content_type: 'media'
			});

		if (result) {

			let fetchedPosts;

			if(result.items)
			{
				fetchedPosts = result.items;
				fetchedPosts.forEach(a => store.commit('setPosts', a));
				return { fetchedPosts }
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