<template>
	<div>

		<h1>自主上映について</h1>
		<br><br>
		<p>自主上映会サポーター募集！　お住まいの地域、学校、グループで、映画を上映しませんか？</p>

		<v-carousel
			cycle
			hide-delimiter-background
			show-arrows-on-hover
			height="auto"
			><v-carousel-item
				v-for="arr in gallery"
				:key="arr.key"
					><v-img :src="generateImageUrl(arr.data.fields.file.url)"></v-img>
			</v-carousel-item>
		</v-carousel>

		<h2>宣伝資材</h2>
		<p>上映作品のスチール写真やテキストは、無償でご提供します。 『ブライアンと仲間たち』、『さようならUR』、『インド日記』は、チラシとポスターもご用意しています。</p>

		<h3>映画のチラシ</h3>
		<p>1枚5円（50枚単位）＋送料実費<br>
		B5両面、フルカラー、裏面に上映会情報印刷用の余白あり</p>
		<v-img
		v-for="arr in flyer"
		:key="arr.key"
			:src="generateImageUrl(arr.data.fields.file.url)"></v-img>



		<br>
		<contactUs></contactUs>

		<br><br>
		<nuxt-link :to="{name:'index'}">←HOME</nuxt-link>
	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { createClient } from '@/plugins/contentful'

import cardFilm from '@/components/card_film'
import contactUs from '@/components/contact_us'

const client = createClient();

export default {

	components:{
		cardFilm, contactUs
	}

	, head()
	{
	}

	, computed: {
		...mapGetters(['linkTo', 'dateFormat'])

	}

	, methods: {


		sort: function(data)
		{
			let arr = Object.keys(data).map((e) => ({
				  key: e
				, sorted : data[e].fields.title
				, data   : data[e]
			}));
			return arr.sort((a, b) => a.sorted < b.sorted ? -1 : 1);
		}

		, generateImageUrl: function(path)
		{
			let imgPath = path + '?fit=thumb';
			return imgPath;
		}

	}

	, created: function()
	{
		this.gallery = this.sort(this.gallery);
		this.flyer = this.sort(this.flyer);
	}

	// 記事取得
	, async asyncData({ payload, store, params, error }){

		const result = await Promise.all([
				  client.getAssets({ 'fields.title[match]' : '自主上映について' })
				, client.getAssets({ 'fields.title[match]' : 'チラシ' })
				, client.getAssets({ 'fields.title[match]' : 'インド日記 DVDジャケット' })
			]);

		if (result) {
			return {
				  gallery: result[0].items
				, flyer:   result[1].items
				, poster:  result[2].items
			}

		} else {
			return error({ statusCode: 400 })
		}
	}

}
</script>