<template>
	<div>
		<h1>{{archiveTitle}}年度<br>
		上映会・イベントアーカイブ</h1>

		<br>
		<nuxt-link :to="{name:'event'}">←最新イベント</nuxt-link>
		<br>

		<div
		v-if="rawPosts"
			v-for="item in rawPosts"
				><cardEvent :post="item.data"></cardEvent>
		</div>

		<div v-else>
			ないです
		</div>

	</div>
</template>


<script>
import { mapState, mapGetters } from 'vuex'

import { createClient } from '@/plugins/contentful'

import cardEvent from '@/components/card_event'

const client = createClient();

export default {

	async asyncData({ payload, store, params, error }) {
		const results = payload || await client.getEntries({
			content_type: 'event'
			, 'fields.startDate[lte]' : params.archive + '-12-31'
			, 'fields.startDate[gte]' : params.archive + '-01-01'
		});

		if (results)
		{
			if(results.items.length){
				let arr = Object.keys(results.items).map((e) => {
					return {
						  key: e
						, startDate : results.items[e].fields.startDate
						, data      : results.items[e]
					}
				});
				const rawPosts = arr.sort((a, b) => a.startDate < b.startDate ? -1 : 1);
				return { rawPosts }
			}
			else
			{
				// alert('ないです')
				return error({ statusCode: 400 })
			}
		}else
		{
			return error({ statusCode: 400 })
		}
	}

	, components:{
		cardEvent
	}


	, data: function()
	{
		return {
			archiveTitle: this.$route.params.archive
		}
	}

	, computed: {
		...mapGetters(['linkTo', 'dateFormat', 'renderRichText'])
	}
}
</script>