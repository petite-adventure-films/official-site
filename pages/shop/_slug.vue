<template>
	<div>
		<h3>{{post.fields.title}}</h3>

		<pre>{{post.fields.catchphrase}}</pre>

		<div v-if="post.fields.prices">
			<div v-for = "(arr, key) in post.fields.prices"
				:key="key">
				{{arr.key}} {{convertYen(arr.data.price)}}
				<v-select
					:items="purchaseLimit"
					label="数量を入力してください"
					v-model = "purchase[key]"
				></v-select>
			</div>
			※価額はすべて税込です
		</div>
		<v-btn color="purple" @click="addCart()" @click.stop="dialog = true">カートに追加する</v-btn><br>

		 <v-dialog
			v-model="dialog"
			max-width="290"
			><v-card class="pa-4">
				カートに追加しました<br>
				<v-btn color="purple" :to="{name: 'cart'}">カートを見る</v-btn><br>
				<v-btn outlined class="mt-1" @click="dialog=false">買い物を続ける</v-btn>
			</v-card>
		</v-dialog>


		<br>
		<hr>

		<h4>DVD構成</h4>
		<div v-for = "arr in film.fields.details">
			{{arr.key}}: <span v-for = "val in arr.data" :key=val>{{val}}</span>
		</div>
		<p>{{film.fields.genre}} / {{film.fields.country}} / {{film.fields.releaseYear}} / {{film.fields.runningTime}}</p>
		<p class="mt-2" v-if="post.fields.details" v-html="post.fields.details.replace(/\n/g,'<br>')"></p>
		<contactUs :message="message"></contactUs>

		<br>
		<hr>

		<h4>DVD特典</h4>
		<p class="mt-2" v-if="post.fields.special" v-html="post.fields.special.replace(/\n/g,'<br>')"></p>

		<br>
		<hr>

		<h4>制作クレジット</h4>
		<div v-for = "arr in film.fields.credit">
			<h5>{{arr.key}}</h5>
			<div v-for = "(data, key) in arr.data" :key="key">
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


	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {

	data() {
		return {
			  message: 'DVD購入や上映についてのお問い合わせはこちらから'
			, purchaseLimit: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
			, alreadyAdded: false
			, dialog: false
		}
	}

	, computed: {
		...mapState(['pafCart'])
		, ...mapGetters(['linkTo', 'dateFormat', 'renderRichText'])

		, purchase: function()
		{
			let arr = [];
			let thisItem = this.pafCart[this.post.sys.id];
			if(thisItem)
			{
				thisItem.forEach((v) => arr.push(v))
				return arr
			}
			else
			{
				return []
			}
		}

		, film: function()
		{
			return this.post.fields.film
		}



	}

	, methods: {

		generateImageUrl: function(path)
		{
			let imgPath = path + '?fit=thumb';
			return imgPath;
		}

		, convertYen: function(number)
		{
			return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(number);
		}

		, addCart: function()
		{
			this.$store.commit('setCart', {id: this.post.sys.id, purchase: this.purchase})
			this.$store.commit('setCartCount')
		}

	}

	, mounted()
	{
	}

	, async asyncData({ payload, store, params, error })
	{
		const post = await store.state.shop.find(post => post.fields.slug === params.slug);
		if (post) {
			return {post}
		} else {
			return error({ statusCode: 400 })
		}
	}

}
</script>

<style>
.caution{
	background: red;
	color: white;
}
</style>