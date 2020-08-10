<template>
	<div>

		<div
		v-for = "(post, key) in sortedNews"
		:key = "key"
			><cardNews :post="post"></cardNews>
		</div>

		<br>
		<div
		v-for = "(post, key) in film"
		:key = "key"
			><cardFilm :post="post"></cardFilm>
		</div>

	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import cardNews from '@/components/card_news'
import cardFilm from '@/components/card_film'

export default {

	components: {
		cardNews, cardFilm
	}

	, computed: {
		...mapState(['news', 'film'])
		, sortedNews: function(){
			return this.news.slice(0, 3)
		}
	}

}
</script>