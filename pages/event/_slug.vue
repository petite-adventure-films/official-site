<template>
	<article>

		<header>
			<breadcrumbs :addItems="addBreads"></breadcrumbs>
			<v-chip v-if="post.fields.eventType">{{post.fields.eventType.fields.title}}</v-chip><br>
		</header>


		{{post.fields.place}}<br>
		{{post.fields.access}}<br>
		{{post.fields.address}}<a :href="post.fields.mapLink" target="_blank" rel="nofollow">MAP</a><br>
		{{dateFormat(post.fields.startDate)}}
		<span v-if="post.fields.endDate">
		 ~ {{dateFormat(post.fields.endDate)}}
		</span><br>
		<p v-if="post.fields.schedule" v-html="post.fields.schedule.replace(/\n/g,'<br>')"></p>
		{{post.fields.fee}}<br>
		<br>

		<nuxt-link :to="{name:'event'}">←最新イベント</nuxt-link><br>
		<nuxt-link :to="{name:'index'}">←HOME</nuxt-link>
	</article>
</template>

<script>

import { mapState, mapGetters } from 'vuex'
import { createClient } from '@/plugins/contentful'
const client = createClient();

export default {

	async asyncData({ payload, store, params, error, from }) {

		const post = payload
			|| await store.state.event.find(post => post.fields.slug === params.slug)
			|| await client.getEntries({
				  content_type: 'event'
				, 'fields.slug' : params.slug
			});

		if (post) {
			return {
				  post: post.items ? post.items[0] : post
				, from: from
			}
		} else {
			return error({ statusCode: 400 })
		}
	}

	,data: function(){
		return{
			thisYear : new Date().getFullYear()
		}
	}

	, computed: {
		...mapGetters(['linkTo', 'dateFormat', 'renderRichText'])
		, postedYear : function(){
			return new Date(this.post.fields.startDate).getFullYear()
		}
		, isArchivePost : function(){
			return this.postedYear < this.thisYear;
		}
		, addBreads: function(){
			let prevPage = {};
			prevPage.icon =  'mdi-folder-outline'
			if(this.isArchivePost)
			{
				prevPage.text = this.postedYear + '年 アーカイブ'
				prevPage.to   = { name: 'event-archive-year', params: { year: this.postedYear } }
			}
			else
			{
				prevPage.text = '上映会・イベント'
				prevPage.to = { name: 'event' }
			}

			let thisPage = {
				  text: this.post.fields.title
				, to: this.linkTo('event', this.post)
			}

			return [ prevPage, thisPage ]
		}

	}

}
</script>