<template>
	<div>
		<h1>お知らせ</h1>
		<br><br>
		<div
		v-for = "(post, key) in sortedPosts"
		:key = "key"
			><div>
				<nuxt-link :to="linkTo('news', post.data)">
					<v-chip v-if="post.data.fields.eventType">
						{{post.data.fields.eventType.fields.title}}
					</v-chip>
					<v-chip v-if="post.data.fields.relatedFilm">
						{{post.data.fields.relatedFilm.fields.titleAbbr}}
					</v-chip>
					{{post.data.fields.title}}
				</nuxt-link>
			</div>
		</div>
		<br>
		<v-btn v-if="skipped > -1" @click="viewMore">もっと見る</v-btn>
		<br><br>
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
		...mapGetters(['linkTo', 'dateFormat'])
	}

	, methods:
	{

		async viewMore()
		{

			let result = await client.getEntries({
				content_type: 'news'
				, skip: this.skipped
			});

			if (result){
				let fetchedPosts = this.sort(result.items);
				fetchedPosts.forEach((arr, key) => {
					this.sortedPosts.push(arr);
					this.$store.commit('setPosts', arr.data);
				})

				this.skipped = (result.items.length === 100) ? this.skipped + 100 : -1;

				return true
			}
			// console.log('result', result)
		}

		, sort: function(data)
		{
			let arr = Object.keys(data).map((e) => ({
				  key: e
				, sorted : data[e].fields.publishedDate || data[e].sys.createdAt
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
			|| store.state.news.length ? store.state.news : false
			|| await client.getEntries({
				content_type: 'news'
			});

		if (result) {

			let fetchedPosts;

			if(result.items)
			{
				let skipped = 100;
				fetchedPosts = result.items;
				fetchedPosts.forEach(a => store.commit('setPosts', a));
				return { fetchedPosts, skipped }
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