<template>
	<article>

		<cardNews
		v-for = "post in news"
		:key  = "post.sys.id"
			:post="post"></cardNews>


	</article>
</template>


<script>
import { mapState, mapGetters } from 'vuex'
import cardNews from '@/components/card_news'

import { createClient } from '@/plugins/contentful'


export default {

	components: {
		cardNews
	}

	, data: function()
	{
		return{
		}
	}

	, computed: {
		...mapState(['news'])
	}

}
</script>