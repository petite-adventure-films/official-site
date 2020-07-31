<template>
	<div>
		<v-chip>{{post.fields.eventType.fields.name}}</v-chip><br>
		<h3>{{ post.fields.title }}</h3>
		<div v-html="renderRichText(post.fields.body)"></div>
		<div>Posted {{dateFormat(post.sys.createdAt)}}</div>
		<br>
		<nuxt-link :to="{name:'news'}">←News</nuxt-link><br>
		<nuxt-link :to="{name:'index'}">←HOME</nuxt-link>
	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {

	async asyncData({ payload, store, params, error }) {
		const post = payload || await store.state.news.find(post => post.fields.slug === params.slug);

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