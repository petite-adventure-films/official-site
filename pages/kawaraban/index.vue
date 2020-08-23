<template>
    <article>
        <cardPost
		v-for = "item in post"
		:key = "'wakaraban' + item.sys.id"
            :post="item"></cardPost>
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
			// relatedSeries: {}
		}
	}

	, computed:
	{
		...mapState(['category', 'series', 'post', 'pageInfo'])
		, ...mapGetters(['linkTo', 'dateFormat'])
		, postPageInfo: function(){
			return this.pageInfo['post']
		}
		, loadMore: function(){
			let loaded = this.postPageInfo;
			return loaded.skip + loaded.limit < loaded.total;
		}
		, addBreads: function(){
			return [
				{
					icon: 'mdi-folder-outline'
					, text: 'かわら版'
					, to: {name: 'blog'}
				}
			]
		}



	}

	, methods:
	{

		async viewMore()
		{

			let loaded = this.postPageInfo.skip + 100;

			let result = await client.getEntries({
				content_type: 'post'
				, skip: loaded
				, limit: this.postPageInfo.limit
				, order: '-fields.publishedDate,-fields.order,-sys.createdAt'
			});

			if (result){
				this.$store.commit('setPageInfo', result);
				result.items.forEach((arr, key) => {
					this.$store.commit('setPosts', arr);
				})
			}
		}


	}

}
</script>