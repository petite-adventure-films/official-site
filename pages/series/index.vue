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
import cttfClient from '@/plugins/contentful'

import cardPost from '@/components/card_post'

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

    , async asyncData({ payload, store, params, error }) {

        const result = payload
            || (store.state.series.length > 0) ? store.state.series
                : await cttfClient.getEntries({
                    content_type: 'series'
                    , order: 'fields.order,sys.createdAt'
                });

        if (result) {

            if(result.items)
            {
                store.commit('setPosts', result)
                store.commit('setPageInfo', result)

            }
            
        } else {
            return error({ statusCode: 400 })
        }
    }

}
</script>