<template>
	<div>
		<div
		v-for = "(item, key) in post"
		:key = "item.sys.id"
			><cardPost :post="item"></cardPost>
		</div>
	</div>
</template>

<script>
import { mapState} from 'vuex'
import cardNews from '@/components/card_news'
import cardFilm from '@/components/card_film'
import cardPost from '@/components/card_post'

export default {

	components: {
		cardNews, cardFilm, cardPost
	}

	, computed: {
		...mapState(['news', 'film', 'post'])
		, sortedNews: function(){
			return this.news.slice(0, 3)
		}
	}
}
</script>