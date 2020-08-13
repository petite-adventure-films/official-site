<template>
	<article>

		<header>
			<breadcrumbs :addItems="addBreads"></breadcrumbs>
			<h1>{{ post.fields.title }}</h1>
			<v-chip v-if="post.fields.eventType">
				{{post.fields.eventType.fields.title}}
			</v-chip>
			<v-chip v-if="post.fields.relatedFilm">
				{{post.fields.relatedFilm.fields.titleAbbr}}
			</v-chip>
		</header>

		<br>

		<div v-html="renderRichText(post.fields.body)"></div>

		<cardEvent
		v-if="post.fields.relatedEvent"
			:post="post.fields.relatedEvent"></cardEvent>

		<cardFilm
		v-if="post.fields.relatedFilm"
			:post="post.fields.relatedFilm"></cardFilm>

		<br>

		<div v-if = "post.fields.updatedAt && post.fields.createdAt != post.fields.updatedAt">
			修正 {{dateFormat(post.sys.updatedAt)}}
		</div>
		<div>{{dateFormat(post.fields.publishedDate || post.sys.createdAt)}} 作成</div>

	</article>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { createClient } from '@/plugins/contentful'

import cardEvent from '@/components/card_event'
import cardFilm from '@/components/card_film'

const client = createClient();

export default {

	async asyncData({ payload, store, params, error }) {
		const post = await store.state.news.find(post => post.fields.slug === params.slug)
			|| await client.getEntries({
				  content_type: 'news'
				, 'fields.slug' : params.slug
			});

		if (post) {
			return { post: post.items ? post.items[0] : post }
		} else {
			return error({ statusCode: 400 })
		}
	}

	, components: {
		cardEvent, cardFilm
	}

	, computed: {
		...mapGetters(['linkTo', 'dateFormat', 'renderRichText'])

		, addBreads: function(){
			return [
				{
					  icon: 'mdi-folder-outline'
					, text: 'お知らせ'
					, to: { name: 'news'}
				}
				, {
					text: this.post.fields.title
					, to: this.linkTo('news', this.post)
				}
			]
		}
	}
}
</script>