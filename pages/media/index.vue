<template>
	<div>

		<header>
			<breadcrumbs :addItems="addBreads"></breadcrumbs>
			<h1>メディア紹介</h1>
		</header>

		<div
		v-for = "post in media"
		:key  = "post.key"
			><cardMedia :post="post"></cardMedia>
		</div>

	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { createClient } from '@/plugins/contentful'

import cardMedia from '@/components/card_media'

const client = createClient();

export default {

	head()
	{
		return {
			script: [ { src: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.4.456/build/pdf.min.js', body: true } ]
		}
	}

	, components:{
		cardMedia
	}

	, computed: {
		...mapState(['media'])
		, ...mapGetters(['linkTo', 'dateFormat'])

		, addBreads: function(){
			return [
				{
					icon: 'mdi-folder-outline'
					, text: 'メディア紹介'
					, to: {name: 'media'}
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