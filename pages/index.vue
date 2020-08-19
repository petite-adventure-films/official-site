<template>
	<div>

		dev test

	</div>
</template>

<script>
import { mapState} from 'vuex'
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