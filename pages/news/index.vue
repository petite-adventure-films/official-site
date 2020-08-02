<template>
	<div>
		<h1>お知らせ</h1>
		<br><br>
		<div
		v-for = "post in storedPosts"
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
		<br><br>
		<nuxt-link :to="{name:'index'}">←HOME</nuxt-link>
	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {

	data: function()
	{
		return{
			sortedPosts   : []
		}
	}

	, computed: {
		  ...mapState(['news'])
		, ...mapGetters(['linkTo', 'dateFormat'])
	}

	, created: function()
	{
		let storePosts = this.$store.state.news;

		let arr = Object.keys(storePosts).map((e) => ({
				  key: e
				, sorted : storePosts[e].fields.publishedDate || storePosts[e].sys.createdAt
				, data      : storePosts[e]
			}));
		this.storedPosts = arr.sort((a, b) => a.sorted < b.sorted ? 1 : -1);
	}

}
</script>