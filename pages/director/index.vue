<template>
	<article>
		監督<br>
		早川由美子（はやかわゆみこ）<br>
		ドキュメンタリー監督
		<v-img
			:src="generateImageUrl(image.fields.file.url, '224')"
			width=200></v-img>
		<p>東京都出身。成蹊大学法学部、London School of Journalism卒業。公務員、会社員を経て、ジャーナリストを志し2007年に渡英。ロンドンでジャーナリズムを学ぶ傍ら、独学で映像制作を始める。イギリス国会前の平和活動家、ブライアン･ホウを追った初監督作『ブライアンと仲間たち パーラメント･スクエアSW1』(2009年)で、日本ジャーナリスト会議･黒田清JCJ新人賞を受賞。2009年に帰国し、以降は東京を拠点に活動。日本の公共住宅問題を取り上げた2作目『さようならUR』(2011年)で、山形国際ドキュメンタリー映画祭･スカパー!IDEHA賞を受賞。その他の作品に、『乙女ハウス』(2013年)、『木田さんと原発、そして日本』(2013年)、『ホームレスごっこ』(2014年)など。自身の作品制作の他、市民による情報発信力を高めるため、スマホやビデオカメラによる撮影･編集のワークショップなども積極的に行う。</p>
		<hr>
		Filmography
		<v-timeline>
			<v-timeline-item
				v-for="(arr, key) in sortedFilmPostsbyTime"
				:key="'filmography' + key"
				small
				><template v-slot:opposite>
					<span>{{key}}</span>
				</template>
				<cardFilm
				v-for="post in arr"
				:key="'filmography'+ key + post.data.sys.id"
					:post="post.data"></cardFilm>
			</v-timeline-item>
		</v-timeline>
	</article>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import cttfClient from '@/plugins/contentful'

import cardFilm from '@/components/card_film'

export default {

	components:{
		cardFilm
	}

	, computed: {
		...mapGetters(['linkTo', 'dateFormat'])

		, sortedFilmPostsbyTime: function()
		{
			let arr = {};
			this.filmPosts.forEach((a) => {
				let key = a.data.fields.releaseYear;
				if(arr[key] === undefined)
				{
					arr[key] = [];
				}
				arr[key].push(a)
			});
			// console.log('arr', arr);
			return arr;
		}
	}

	, methods: {

		sort: function(data)
		{
			let arr = Object.keys(data).map((e) => ({
				  key: e
				, sorted : data[e].fields.releaseYear
				, data   : data[e]
			}));
			return arr.sort((a, b) => a.sorted < b.sorted ? 1 : -1);
		}

		, generateImageUrl: function(path, round)
		{
			let imgPath = path + '?fit=thumb&r=' + round;
			return imgPath;
		}

	}

	, created: function()
	{
		this.filmPosts = this.sort(this.filmPosts);
	}

	, async asyncData({ payload, store, params, error }){

		const result = await Promise.all([
				  cttfClient.getAssets({ 'fields.title' : '監督' })
				, cttfClient.getEntries({ content_type: 'film' })
			]);

		if (result) {
			return {
				  image: result[0].items[0]
				, filmPosts: result[1].items
			}

		} else {
			return error({ statusCode: 400 })
		}
	}

}
</script>