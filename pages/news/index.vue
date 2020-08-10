<template>
	<article>

		<header>
			<breadcrumbs :addItems="addBreads"></breadcrumbs>
			<h1>お知らせ</h1>
		</header>

		<div
		v-for = "(post, key) in news"
		:key = "key"
			><cardNews :post="post"></cardNews>
		</div>
		<br>

		<v-btn v-if="loadMore" @click="viewMore">もっと見る</v-btn>
	</article>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { createClient } from '@/plugins/contentful'

import cardNews from '@/components/card_news'

const client = createClient();

export default {

	components: {
		cardNews
	}

	, data: function()
	{
		return{
		}
	}

	, computed:
	{
		  ...mapState(['news', 'pageInfo', 'pageInfo'])
		, ...mapGetters(['linkTo', 'dateFormat'])
		, postPageInfo: function(){
			return this.pageInfo['news']
		}
		, loadMore: function(){
			let loaded = this.postPageInfo;
			return loaded.skip + loaded.limit < loaded.total;
		}
		, addBreads: function(){
			return [
				{
					icon: 'mdi-folder-outline'
					, text: 'お知らせ'
					, to: {name: 'news'}
				}
			]
		}
	}

	, methods:
	{

		async viewMore()
		{

			let loaded = this.postPageInfo.skip + 20;

			let result = await client.getEntries({
				content_type: 'news'
				, skip: loaded
				, limit: this.postPageInfo.limit
				, order: '-fields.publishedDate,-sys.createdAt'
			});

			if (result){
				this.$store.commit('setPageInfo', result);
				result.items.forEach((arr, key) => {
					this.$store.commit('setPosts', arr);
				})
				return true;
			}
		}

	}

	, created: function()
	{
	}

}
</script>