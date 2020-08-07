<template>
	<div>
		<h1>かわら版</h1>
		<br><br>
		<div
		v-for = "(category, key) in fetchedCategory"
		:key = "key"
			><v-btn outline clatt="mt-1" :to = "linkTo('category', category)">{{category.fields.title}}</v-btn>
		</div>
		<br>
		<div
		v-for = "(series, key) in fetchedSeries"
		:key = "key"
			><span>{{series.fields.title}}</span> /
		</div>
		<br>
		<div
		v-for = "(post, key) in sortedPosts"
		:key = "key"
			><cardPost :post="post.data"></cardPost>
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

import cardPost from '@/components/card_post'

const client = createClient();

export default {

	components:{
		cardPost
	}

	, data: function()
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
				content_type: 'post'
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
			|| await Promise.all([
				  client.getEntries({ content_type: 'post' })
				, client.getEntries({ content_type: 'category' })
				, client.getEntries({ content_type: 'series' })
			]);

		if (result) {

console.log('reslt', result)
			let skipped = 100;
			let fetchedPosts = result[0].items;
			let fetchedCategory = result[1].items;
			let fetchedSeries = result[2].items;
			fetchedPosts.forEach(a => store.commit('setPosts', a));
			return { fetchedPosts, skipped, fetchedCategory, fetchedSeries }

		} else {
			return error({ statusCode: 400 })
		}
	}

}
</script>