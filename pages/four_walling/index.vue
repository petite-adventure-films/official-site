<template>
    <article>
        自主上映について
		<br><br>
		<p>自主上映会サポーター募集！　お住まいの地域、学校、グループで、映画を上映しませんか？</p>

		<v-carousel
			cycle
			hide-delimiter-background
			show-arrows-on-hover
			height="auto"
			><v-carousel-item
				v-for="arr in gallery"
				:key="'gallery' + arr.data.sys.id"
					><v-img :src="generateImageUrl(arr.data.fields.file.url)"></v-img>
			</v-carousel-item>
		</v-carousel>

		宣伝資材<br>
		<p>上映作品のスチール写真やテキストは、無償でご提供します。 『ブライアンと仲間たち』、『さようならUR』、『インド日記』は、チラシとポスターもご用意しています。</p>

		映画のチラシ<br>
		<p>1枚5円（50枚単位）＋送料実費<br>
		B5両面、フルカラー、裏面に上映会情報印刷用の余白あり</p>
		<v-img
		v-for="arr in flyer"
		:key="'flyer' + arr.data.sys.id"
			:src="generateImageUrl(arr.data.fields.file.url)"></v-img>
		<br>
		<contactUs></contactUs>

    </article>
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