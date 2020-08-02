<template>
	<div>

		<v-chip v-if="post.fields.eventType">
			{{post.fields.eventType.fields.title}}
		</v-chip>
		<v-chip v-if="post.fields.relatedFilm">
			{{post.fields.relatedFilm.fields.titleAbbr}}
		</v-chip>
		<h3>{{ post.fields.title }}</h3>
		<div v-html="renderRichText(post.fields.body)"></div>

		<div v-if = "!post.fields.updatedAt && post.fields.createdAt != post.fields.updatedAt">
			修正 {{dateFormat(post.sys.updatedAt)}}
		</div>
		<div>作成 {{dateFormat(post.fields.publishedDate || post.sys.createdAt)}}</div>

		<br><br>

		<v-card
		v-if = "post.fields.relatedEvent"
		:to  = "linkTo('event', post.fields.relatedEvent)"
			outlined
			><v-card-text>
				<v-chip v-if="post.fields.relatedEvent.fields.eventType">
					{{post.fields.relatedEvent.fields.eventType.fields.title}}
				</v-chip>
				<v-chip v-if="post.fields.relatedEvent.fields.relatedFilm">
					{{post.fields.relatedEvent.fields.relatedFilm.fields.titleAbbr}}
				</v-chip>
			</v-card-text>
			<v-card-title>
				<div>{{post.fields.relatedEvent.fields.title}}</div>
			</v-card-title>
			<v-card-text class="text--primary">
				<div>
					{{post.fields.relatedEvent.fields.startDate}}
					<span v-if="post.fields.relatedEvent.fields.endDate">
						~ {{post.fields.relatedEvent.fields.endDate}}
					</span>
				</div>
				<div>
					{{post.fields.relatedEvent.fields.place}}<br>
					{{post.fields.relatedEvent.fields.address}}
				</div>
			</v-card-text>
		</v-card>

		<br><br>

		<nuxt-link :to="{name:'news'}">←お知らせ</nuxt-link><br>
		<nuxt-link :to="{name:'index'}">←HOME</nuxt-link>
	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {

	async asyncData({ payload, store, params, error }) {
		const post = payload || await store.state.news.find(post => post.fields.slug === params.slug);
console.log('post', post)
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