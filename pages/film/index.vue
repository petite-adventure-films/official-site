<template>
	<div>
		<h1>映画</h1>
		<br><br>
		<div
		v-for = "post in film"
		:key  = "post.sys.id"
			><cardFilm :post="post"></cardFilm>
		</div>
		<br><br>
		<nuxt-link :to="{name:'index'}">←HOME</nuxt-link>
	</div>
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