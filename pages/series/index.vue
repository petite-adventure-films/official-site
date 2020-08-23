<template>
    <article>
        かわら版 - {{pageTitle}}<br>

        <v-btn outlined :to="{name: 'series-recommend'}">おすすめ</v-btn>
	    <v-btn
        v-for = "item in series"
		:key = "'series' + item.sys.id"
            outlined class="mt-1"
            :to = "linkTo('series', item)">{{item.fields.title}}</v-btn>
        
    </article>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { createClient } from '@/plugins/contentful'

import cardPost from '@/components/card_post'

const client = createClient();

export default {

	components:{
		cardPost
	}

	, data: function()
	{
		return{
			pageTitle: '連載記事'
		}
	}

	, computed:
	{
		...mapState(['series'])
		, ...mapGetters(['linkTo', 'dateFormat'])
		, addBreads: function(){
			return [
				{
					icon: 'mdi-folder-outline'
					, text: 'かわら版'
					, to: {name: 'blog'}
				}
				, {
					icon: 'mdi-folder-outline'
					, text: '連載記事'
					, to: {name: 'series'}
				}
			]
		}
	}

	, methods:
	{
    }


}
</script>