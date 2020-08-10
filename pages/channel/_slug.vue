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

		<youtube :video-id="post.fields.youtubeVideoId"></youtube>
		<div>{{post.fields.country}} / {{post.fields.releaseYear}} / {{post.fields.runningTime}}</div>

		<br>
		<div v-html="renderRichText(post.fields.body)"></div>

		<div v-if="post.fields.relatedBlogPost">
			<h2>関連記事</h2>
			<cardPost :post="post.fields.relatedBlogPost"></cardPost>
		</div>

	</article>
</template>

<script>

import { mapState, mapGetters } from 'vuex'
import cardPost from '@/components/card_post'

export default {

	async asyncData({ payload, store, params, error }) {
		const post = await store.state.video.find(post => post.fields.slug === params.slug);

		if (post) {
			return { post }
		} else {
			return error({ statusCode: 400 })
		}
	}

	, components:{
		cardPost
	}

	, computed: {
		...mapGetters(['linkTo', 'dateFormat', 'renderRichText'])
		, addBreads: function(){
			return [
				{
					  icon: 'mdi-folder-outline'
					, text: 'チャンネル'
					, to: { name: 'channel'}
				}
				, {
					text: this.post.fields.title
					, to: this.linkTo('channel', this.post)
				}
			]
		}
	}

}
</script>