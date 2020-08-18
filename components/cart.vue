<template>
	<div>
		<div class="item" v-for="item in addedItems" :key="item.sys.id">
			{{item.fields.title}}<br>
			<div
			v-for="(unit, key) in pafCart[item.sys.id]"
			:key="key"
				v-if="unit > 0">
					{{item.fields.prices[key].key}}
					{{convertYen(item.fields.prices[key].data.price)}}
					<span v-if="inRegister">{{unit}}</span>
					<v-select
						v-if="!inRegister"
						:items="purchaseLimit"
						v-model="currentCart[item.sys.id][key]"
						@input="update(item.sys.id, key)"
					></v-select>
					<v-btn text v-if="!inRegister" @click.stop="openCancelModal(item, key, unit)">削除</v-btn>
					{{convertYen(item.fields.prices[key].data.price * unit)}}
			</div>
			<div class="subtotal">小計 : {{subtotal(item)}}</div>
		</div>
		<div class="total">
			合計 : {{convertYen(total())}}
		</div>
		<cartCancel :dialog="dialog" :data="cancelData" @close="closeCancelModal" @excu="cancel"></cartCancel>
	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import cartCancel from '@/components/cart_cancel'

export default {

	props: ['inRegister', 'addedItems', 'currentCart']

	, components: {
		cartCancel
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


	}

	, methods: {

		convertYen: function(number)
		{
			return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(number);
		}

		, subtotal: function(item)
		{
			let unitTotal = 0;
			this.pafCart[item.sys.id].forEach((v, k) => {
				let sum = item.fields.prices[k].data.price * v
				unitTotal = unitTotal + sum
			})
			return this.convertYen(unitTotal)
		}

		, closeCancelModal: function()
		{
			this.dialog = false
		}

		, openCancelModal: function(item, key, unit)
		{
			this.cancelData = {item: item, key: key, unit: unit}
			this.dialog = true;
		}

		, total: function()
		{
			let total = 0;
			if(this.addedItems)
			{
				this.addedItems.forEach((i) => {
					let subtotal = 0;
					i.fields.prices.forEach((p, k) => {
						if(this.pafCart[i.sys.id][k] > 0){
							subtotal = subtotal + (p.data.price * this.pafCart[i.sys.id][k])
						}
					})
					total = total + subtotal
				})
			}
			return total
		}

	}


	, created()
	{

		// let self = this;
		// console.log('this', this.pafCart)
		// console.log('this', this.$store.state.pafCart)
		// Object.keys(this.pafCart).forEach((k) => {
		// 	console.log('k', k)
		// 	this.currentCart[k] = []
		// 	this.pafCart[k].forEach((v) => {
		// 		this.currentCart.push(v)
		// 	})

		// })

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
	margin-top: 0.5em;
	padding: 0.5em;
	background: #dddddd;
	text-align: right
}
.subtotal{
	background: #eeeeee;
	text-align: right
}
</style>
