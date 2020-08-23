<template>
    <article>

		映像制作を学びませんか？
		<br><br>
		<p>ビデオカメラが小型化し、値段も手ごろとなり、スマホでも簡単に動画が撮影できる時代になりました。それに伴い、「映像制作に興味がある」、「自分たちの活動を映像で紹介したい」、「スマホで撮った映像を編集したい」等々、映像制作を学びたい方が増えています。プチ・アドベンチャー・フィルムズでは、初心者～中級者を対象に、ニーズに合わせた映像ワークショップを承っております。ご興味のある方は、お問い合わせよりご連絡ください。</p>

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

		<contactUs></contactUs>

    </article>
</template>


<script>
import { mapState, mapGetters } from 'vuex'
import { createClient } from '@/plugins/contentful'

import contactUs from '@/components/contact_us'

const client = createClient();

export default {

	components:{
		contactUs
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
	}

	
	, async asyncData({ payload, store, params, error }){

		const result = await Promise.all([
			client.getAssets({ 'fields.title[match]' : 'ワークショップについて' })
		]);

		if (result) {
			return { gallery: result[0].items }

		} else {
			return error({ statusCode: 400 })
		}
	}

}
</script>