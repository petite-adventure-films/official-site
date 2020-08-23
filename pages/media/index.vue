<template>
	<article>
		<cardMedia
		v-for = "post in media"
		:key  = "'media' + post.sys.id"
			:post="post"></cardMedia>
	</article>
</template>


<script>
import { mapState, mapGetters } from 'vuex'
import cardMedia from '@/components/card_media'

export default {

	components:{
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