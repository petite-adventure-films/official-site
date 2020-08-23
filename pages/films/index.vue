<template>
	<article>
		<cardFilm
		v-for = "post in film"
		:key  = "'film' + post.sys.id"
			:post="post"></cardFilm>
	</article>
</template>
<script>
import { mapState, mapGetters } from 'vuex'
import cardFilm from '@/components/card_film'

export default {

	components:{
		cardFilm
	}

	, computed: {
		...mapState(['film'])
		, ...mapGetters(['linkTo', 'dateFormat'])
	}

	, created: function()
	{
	}

}
</script>