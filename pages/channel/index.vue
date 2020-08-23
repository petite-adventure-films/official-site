<template>
	<article>
		<cardVideo
		v-for = "post in video"
		:key  = "'video'+post.sys.id"
			:post="post"></cardVideo>
	</article>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import cardVideo from '@/components/card_video'

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