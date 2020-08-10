<template>
	<div>
		<header>
			<breadcrumbs :addItems="addBreads"></breadcrumbs>
			<h1>かわら版</h1>
		</header>

		<div
		v-for = "(item, key) in category"
		:key = "item.sys.id"
			><v-btn outlined class="mt-1" :to = "linkTo('category', item)">{{item.fields.title}}</v-btn>
		</div>
		<br>
		<div
		v-for = "(item, key) in series"
		:key = "item.sys.id"
			><v-btn outlined class="mt-1" :to = "linkTo('category', item)">{{item.fields.title}}</v-btn>
		</div>
		<br>
		<div
		v-for = "(item, key) in post"
		:key = "item.sys.id"
			><cardPost :post="item"></cardPost>
		</div>
		<br>
		<v-btn v-if="loadMore" @click="viewMore">もっと見る</v-btn>
		<br><br>
		<nuxt-link :to="{name:'index'}">←HOME</nuxt-link>
	</div>
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
				return true;
			}
		}

	}


}
</script>