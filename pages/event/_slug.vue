<template>
	<div>
		<v-chip>{{post.fields.eventType.fields.name}}</v-chip><br>
			{{post.fields.place}}<br>
			{{post.fields.access}}<br>
			{{post.fields.address}}<br>
			{{post.fields.mapLink}}<br>
			{{dateFormat(post.fields.startDate)}} ~ {{dateFormat(post.fields.endDate)}}<br>
			{{post.fields.scehdule}}<br>
			{{post.fields.fee}}<br>
		<br>
		<nuxt-link :to="{name:'event'}">←Events</nuxt-link><br>
		<nuxt-link :to="{name:'index'}">←HOME</nuxt-link>
	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {

	async asyncData({ payload, store, params, error }) {
		const post = payload || await store.state.event.find(post => post.fields.slug === params.slug);

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