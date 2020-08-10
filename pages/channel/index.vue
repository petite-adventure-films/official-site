<template>
	<div>

		<header>
			<breadcrumbs :addItems="addBreads"></breadcrumbs>
			<h1>チャンネル</h1>
		</header>

		<div
		v-for = "post in video"
		:key  = "post.key"
			><cardVideo :post="post"></cardVideo>
		</div>

	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { createClient } from '@/plugins/contentful'

import cardVideo from '@/components/card_video'

const client = createClient();

export default {

	components:{
		cardVideo
	}

	, computed: {
		...mapState(['video'])
		, ...mapGetters(['linkTo', 'dateFormat'])

		, addBreads: function(){
			return [
				{
					icon: 'mdi-folder-outline'
					, text: 'チャンネル'
					, to: {name: 'channel'}
				}
			]
		}

	}

	, methods: {
	}

	, created: function()
	{
	}

}
</script>