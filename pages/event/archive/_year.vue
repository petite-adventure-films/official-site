<template>
	<article>

		{{archiveTitle}}年 上映会・イベントアーカイブ<br>
		<nuxt-link :to="{name:'event'}">←最新イベント</nuxt-link>

		<div
		v-for="item in post"
		:key="'eventArchive' + item.sys.id"
			><cardEvent :post="item"></cardEvent>
		</div>

	</article>
</template>


<script>
import { mapState, mapGetters } from 'vuex'

import { createClient } from '@/plugins/contentful'

import cardEvent from '@/components/card_event'

const client = createClient();

export default {

	components:{
		cardEvent
	}

	, data: function()
	{
		return {
			archiveTitle: this.$route.params.year
		}
	}

	, computed: {
		...mapGetters(['linkTo', 'dateFormat', 'renderRichText'])
	}

	, async asyncData({ payload, store, params, error }) {
		const results = await client.getEntries({
			content_type: 'event'
			, order: 'fields.startDate,sys.createdAt'
			, 'fields.startDate[lte]' : params.year + '-12-31'
			, 'fields.startDate[gte]' : params.year + '-01-01'
		});

		if (results)
		{
			return { post : results.items}
		}else
		{
			return error({ statusCode: 400 })
		}
	}

}
</script>