<template>
	<div>
		<h3>{{post.fields.title}}</h3>

		<div v-if="post.fields.awards">
			<hr>
			<div v-for = "arr in post.fields.awards">
				{{arr.key}}<br>
				<span v-for = "val in arr.data">{{val}}</span>
			</div>
		</div>

		<div v-if="post.fields.catchphrase">
			<hr>
			{{post.fields.catchphrase}}<br>
		</div>

		<hr>
		{{post.fields.leadText}}<br>

		<hr>
		<v-img :src="generateImageUrl(post.fields.poster.fields.file.url)"></v-img>

		<hr>
		{{post.fields.genre}} / {{post.fields.country}} / {{post.fields.releaseYear}} / {{post.fields.runningTime}}
		<div v-for = "arr in post.fields.details">
			{{arr.key}}: <span v-for = "val in arr.data">{{val}}</span>
		</div>

		<div v-if="post.fields.recommends">
			<hr>
			<h4>推薦のことば</h4>
			<div v-for = "arr in post.fields.recommends">
				{{arr.key}} {{arr.data.belongs}}<br>
				{{arr.data.comments}}
			</div>
		</div>

		<div v-if="post.fields.gallery">
			<hr>
			<h4>フォトギャラリー</h4>
			<v-carousel
				cycle
				hide-delimiter-background
				show-arrows-on-hover
				height="auto"
				><v-carousel-item
					v-for="arr in post.fields.gallery"
					><v-img :src="generateImageUrl(arr.fields.file.url)"></v-img>
				</v-carousel-item>
			</v-carousel>
		</div>

		<div v-if="post.fields.teaser">
			<hr>
			<h4>予告編</h4>
			<youtube :video-id="post.fields.teaser" />
		</div>

		<div v-if="post.fields.film">
			<hr>
			<h4>本編</h4>
			<youtube :video-id="post.fields.film" />
		</div>

		<hr>
		<h4>あらすじ</h4>
		<div v-html="renderRichText(post.fields.plot)"></div>

		<hr>
		<h4>制作クレジット</h4>
		<div v-for = "arr in post.fields.credit">
			<h5>{{arr.key}}</h5>
			<div v-for = "data in arr.data">
				<!-- さらにオブジェクト -->
				<div v-if="typeof data == 'object'">
					{{data.key}}
					<div v-for = "(val2, key2) in data.data">
						<span v-if="key2">{{key2}}: </span>
						{{val2}}
					</div>
				</div>
				<!-- 配列の場合 -->
				<div v-else>
					{{data}}
				</div>
			</div>
		</div>

		<hr>
		<div v-if="post.fields.domesticFestivals || post.fields.internationalFestivals">
			<h4>映画祭上映履歴</h4>
			<div v-if="post.fields.domesticFestivals">
				<h5>国内</h5>
				<div
				v-for = "(arr, key) in post.fields.domesticFestivals">
					<span>{{arr.key}}</span>
					<span
					v-for = "(val, key) in arr.data">
						{{val}}
					</span>
				</div>
			</div>
			<div v-if="post.fields.internationalFestivals">
				<h5>国際</h5>
				<div
				v-for = "(arr, key) in post.fields.internationalFestivals">
					<span>{{arr.key}}</span>
					<span
					v-for = "(val, key) in arr.data">
						{{val}}
					</span>
				</div>
			</div>
		</div>

		<div v-if="post.fields.tvBroadcasting">
			<hr>
			<h4>放映履歴</h4>
			<div
			v-for = "(arr, key) in post.fields.tvBroadcasting">
				<span>{{arr.key}}</span>
				<span
				v-for = "(val, key) in arr.data">
					{{val}}
				</span>
			</div>
		</div>

		<hr>
		<h4>関連情報</h4>
		<div v-for = "arr in post.fields.relatedInfo">
			<a :href="arr.data.link" target="_blank" rel="nofollow">{{arr.key}}</a>
			{{arr.data.comments}}
		</div>

		<br><br>
		<nuxt-link :to="{name:'film'}">←映画</nuxt-link>
	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {

	data() {
		return {
		}
	}

	, computed: {
		...mapGetters(['linkTo', 'dateFormat', 'renderRichText'])
	}

	, methods: {

		generateImageUrl: function(path)
		{
			let imgPath = path + '?fit=thumb';
			return imgPath;
		}

	}

	, async asyncData({ payload, store, params, error }) {
		const post = payload || await store.state.film.find(post => post.fields.slug === params.slug);
		if (post) {
			return { post }
		} else {
			return error({ statusCode: 400 })
		}
	}
}
</script>