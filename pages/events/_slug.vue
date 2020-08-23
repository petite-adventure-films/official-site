<template>
	<article>

		{{fields.title}}<br>
		{{fields.place}}<br>
		{{fields.access}}<br>
		{{fields.address}}<a :href="fields.mapLink" target="_blank" rel="nofollow">MAP</a><br>
		{{dateFormat(fields.startDate)}}
		<span v-if="fields.endDate">
		 ~ {{dateFormat(fields.endDate)}}
		</span><br>
		<p v-if="fields.schedule" v-html="fields.schedule.replace(/\n/g,'<br>')"></p>
		{{fields.fee}}<br>
		<br>

		<div v-if="fields.relatedReports">
			イベントレポート
			<cardPost
			v-for="post in post.fields.relatedReports"
			:key ="'relatedReports' + post.sys.id"
				:post="post"></cardPost>
		</div>

	</article>
</template>

<script>

import { mapState, mapGetters } from 'vuex'
import { createClient } from '@/plugins/contentful'
const client = createClient();

import cardPost from '@/components/card_post'

export default {

	components: {
		cardPost
	}

	,data: function(){
		return{
			thisYear : new Date().getFullYear()
		}
	}

	, computed: {
		...mapGetters(['linkTo', 'dateFormat', 'renderRichText'])
		, fields: function(){ return this.post.fields }
		, sys: function(){ return this.post.sys }
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
				prevPage.to   = { name: 'events-archive-year', params: { year: this.postedYear } }
			}
			else
			{
				prevPage.text = '上映会・イベント'
				prevPage.to = { name: 'events' }
			}

			let thisPage = {
				  text: this.post.fields.title
				, to: this.linkTo('events', this.post)
			}

			return [ prevPage, thisPage ]
		}

	}

	, async asyncData({ payload, store, params, error, from }) {

		const post = await store.state.event.find(post => post.fields.slug === params.slug)
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

}
</script>