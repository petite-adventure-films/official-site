<template>
	<div>
		<h3>{{post.fields.title}}</h3>

		<youtube :video-id="post.fields.youtubeVideoId"></youtube>
		<div>{{post.fields.country}} / {{post.fields.releaseYear}} / {{post.fields.runningTime}}</div>
		<br>
		<div v-html="renderRichText(post.fields.body)"></div>


		<nuxt-link :to="{name:'channel'}">←チャンネル</nuxt-link><br>
		<nuxt-link :to="{name:'index'}">←HOME</nuxt-link>
	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {

	async asyncData({ payload, store, params, error }) {
		const post = payload
			|| await store.state.video.find(post => post.fields.slug === params.slug);
		if (post) {
			return { post }
		} else {
			return error({ statusCode: 400 })
		}
	}

	, computed: {
		...mapGetters(['linkTo', 'dateFormat', 'renderRichText'])
	}
}
</script>