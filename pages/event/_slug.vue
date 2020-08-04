<template>
	<div>
		<v-chip v-if="post.fields.eventType">{{post.fields.eventType.fields.title}}</v-chip><br>
		{{post.fields.place}}<br>
		{{post.fields.access}}<br>
		{{post.fields.address}}<a :href="post.fields.mapLink" target="_blank" rel="nofollow">MAP</a><br>
		{{dateFormat(post.fields.startDate)}}
		<span v-if="post.fields.endDate">
		 ~ {{dateFormat(post.fields.endDate)}}
		</span><br>
		<p v-html="post.fields.schedule.replace(/\n/g,'<br>')"></p>
		{{post.fields.fee}}<br>
		<br>
		<nuxt-link :to="{name:'event'}">←Events</nuxt-link><br>
		<nuxt-link :to="{name:'index'}">←HOME</nuxt-link>
	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

import { createClient } from '@/plugins/contentful'

const client = createClient();

export default {

	async asyncData({ payload, store, params, error }) {
		const result = payload
			|| await store.state.event.find(post => post.fields.slug === params.slug)
			|| await client.getEntries({
				  content_type: 'event'
				, 'fields.slug' : params.slug
			});

		if (result) {
			let post = result.items ? result.items[0] : result;
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