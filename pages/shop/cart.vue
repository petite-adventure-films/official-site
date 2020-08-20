<template>
	<div>

		<v-btn outlined :to="{name:'shop'}">買い物を続ける</v-btn>
		<br>
		<cart
			:addedItems  = "addedItems"
			:currentCart = "currentCart"></cart>
		<v-btn block color="purple" class="mt-4" :to="{name: 'shop-buy'}">レジに進む</v-btn>

	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import cart from '@/components/cart'

export default {

	components: {
		cart
	}

	, data: function()
	{
		return {
			purchaseLimit: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
			, dialog: false
			, cancelData: {}
		}
	}

	, computed: {
		...mapState(['shop', 'pafCart', 'pafCartCount'])

		, currentCart: function()
		{
			let self = this
			let arr = {}
			Object.keys(this.pafCart).forEach((k) => {
				arr[k] = []
				this.pafCart[k].forEach((v) => { arr[k].push(v) })
			})
			return arr
		}

		, addedItems: function()
		{
			let items = []
			Object.keys(this.pafCart).forEach((k) => {
				let count = 0
				this.pafCart[k].forEach((v) => count = count + v)
				if(count > 0)
				{
					items.push(this.shop.find((a) => a.sys.id === k))
				}
			})
			return items
		}

	}

	, methods: {
	}


	, created()
	{
	}

	, asyncData({ payload, store, params, error })
	{

	}

}
</script>

<style>
.unit{
	display: inline;
	width: 30px;
}

.item{
	border: 1px solid #dddddd;
	margin-top: 1em;
	padding: 1em;
}

.total{
	margin-top: 1em;
	padding: 1em;
	background: #dddddd;
	text-align: right
}
.subtotal{
	background: #eeeeee;
	text-align: right
}
</style>
