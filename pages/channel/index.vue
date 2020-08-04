<template>
	<div>
		<h1>映画</h1>
		<br><br>
		<div
		v-for = "post in sortedPosts"
		:key  = "post.key"
			><cardVideo :post="post.data"></cardVideo>
			<!-- <div>
				 <nuxt-link :to="linkTo('film', post.data)">{{post.data.fields.title}}</nuxt-link><br>
				mg.youtube.com/vi/8rLa7F2HaCI/sddefault.jpg
				<v-img :src="genThumbImgUrl(post.data.fields.youtubeVideoId)"></v-img>
			</div> -->
		</div>
		<br><br>
		<nuxt-link :to="{name:'index'}">←HOME</nuxt-link>
	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { createClient } from '@/plugins/contentful'

import cardVideo from '@/components/card_video'

const client = createClient();

export default {

	components:{
		cardVideo
	}

	, computed: {
		...mapGetters(['linkTo', 'dateFormat'])
	}

	, methods: {

		genThumbImgUrl(id)
		{
			return 'https://img.youtube.com/vi/' + id + '/sddefault.jpg';
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
			|| store.state.video.length ? store.state.video : false
			|| await client.getEntries({
				content_type: 'video'
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