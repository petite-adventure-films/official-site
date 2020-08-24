<template>
	<article>
		{{fields.title}}
		<v-chip v-if="fields.eventType">
			{{fields.eventType.fields.title}}
		</v-chip>
		<v-chip v-if="fields.relatedFilm">
			{{fields.relatedFilm.fields.titleAbbr}}
		</v-chip>

		<div v-html="renderRichText(fields.body)"></div>

		<div>{{dateFormat(fields.publishedDate || sys.createdAt)}} 作成</div>
	</article>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import cttfClient from '@/plugins/contentful'

export default {

	computed: {
		...mapGetters(['dateFormat', 'renderRichText'])
		, fields: function(){ return this.post.fields || {} }
		, sys: function(){ return this.post.sys || {} }
	}

	, async asyncData({ payload, store, params, error }) {
		const post = payload
			|| await store.state.news.find(post => post.fields.slug === params.slug)
			|| await cttfClient.getEntries({
				  content_type: 'news'
				, 'fields.slug' : params.slug
			});

		if (post) {
			return { post: post.items ? post.items[0] : post }
		} else {
			return error({ statusCode: 400 })
		}
	}

}
</script>