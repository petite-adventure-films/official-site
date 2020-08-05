<template>
	<div>
		<h1>映画</h1>
		<br><br>
		<div
		v-for = "post in sortedPosts"
		:key  = "post.sys.id"
			><div>
				<nuxt-link :to="linkTo('film', post)">{{post.fields.title}}</nuxt-link><br>
			</div>
		</div>
		<br><br>
		<nuxt-link :to="{name:'index'}">←HOME</nuxt-link>
	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { createClient } from '@/plugins/contentful'

import cardFilm from '@/components/card_film'

const client = createClient();

export default {

	components:{
		cardFilm
	}

	, computed: {
		...mapGetters(['linkTo', 'dateFormat'])
	}

	, created: function()
	{
		this.sortedPosts = this.fetchedPosts;
	}

	// 記事取得
	, async asyncData({ payload, store, params, error }){

		const result = payload
			|| store.state.film.length ? store.state.film : false
			|| await client.getEntries({
				content_type: 'film'
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