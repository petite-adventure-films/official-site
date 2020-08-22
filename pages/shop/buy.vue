<template>
	<v-stepper v-model="stepper" vertical non-linear>

		<v-stepper-step :complete="stepper > 1" step="1">注文内容</v-stepper-step>
		<v-stepper-content step="1">
			<cart
				:inRegister  = "inRegister"
				:addedItems  = "addedItems"
				:currentCart = "currentCart"></cart>
			<v-btn block color="purple" class="mt-2" @click="checkOrder">次へ進む</v-btn>
		</v-stepper-content>
		<div class="ml-15 mr-15" v-if="stepper > 1">
			<cart
				:inRegister  = "inRegister"
				:addedItems  = "addedItems"
				:currentCart = "currentCart"></cart>
		</div>

		<v-stepper-step :complete="stepper > 2" step="2" editable>購入者情報</v-stepper-step>
		<v-stepper-content step="2">
			<cartUser :user="user" ref="userForm"></cartUser>
			<v-btn block color="purple" class="mt-2" @click="completeConsumerInfo">次へ進む</v-btn>
		</v-stepper-content>
		<div class="ml-15" v-if="stepper > 2">
			{{user.name}}<br>
			{{user.zipcode}} {{user.prefecture}}{{user.city}}{{user.address1}}<br>
			{{user.address2}}<br>
			{{user.tel}}<br>
			{{user.email}}
		</div>

		<v-stepper-step :complete="stepper > 3" step="3" editable>決済情報</v-stepper-step>
		<v-stepper-content step="3">

			<v-radio-group v-model="paymentMethod" :mandatory="false" :rules="[required]">
				<v-radio label="銀行振込" value="1"></v-radio>
				<div v-if="paymentMethod == 1">
					振込先情報は購入完了メールに記載されております。<br>振込手数料はご負担下さい。
				</div>
				<v-radio label="クレジットカード" value="2"></v-radio>
				<div v-if="paymentMethod == 2">
					注文確定後、決済画面に遷移します。
				</div>
			</v-radio-group>

			<v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
				<v-card>
					<v-btn icon @click="dialog = false">
						<v-icon>mdi-close</v-icon>
					</v-btn>
					<v-btn block color="purple" class="mt-2" @click="purchase">決済</v-btn>
				</v-card>
			</v-dialog>

			<v-form name="order" method="POST" data-netlify="true" data-netlify-honeypot="bot-field">
				<input type="hidden" name="form-name" value="contact">
				<input type="hidden" name="bot-field">
				<input type="hidden" name="name">
				<input type="hidden" name="address">
				<input type="hidden" name="tel">
				<input type="hidden" name="email">
				<v-btn block color="purple" class="mt-2" @click="completeOrder">注文確定</v-btn>
			</v-form>
		</v-stepper-content>

	</v-stepper>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import cart from '@/components/cart'
import cartUser from '@/components/cart_user'

import { Card, createToken } from 'vue-stripe-elements-plus'

export default {

	components: {
		cart, cartUser, Card
	}

	, data: function()
	{
		return{
			stepper: 3
			, dialog: false
			, inRegister: true

			// 購入者情報フォーム
			, user: {
				  name: 'なまえ'
				, zipcode: '1500000'
				, prefecture: '東京都'
				, city: '東京区'
				, address1: '123'
				, address2: '456'
				, tel: '12345678912'
				, email: 'drestard@gmail.com'
				, emailConfirm: 'drestard@gmail.com'
			}

			, paymentMethod : 0
			, required: val => !!val || '必ず入力してください'



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
			let order = {}
			Object.keys(this.pafCart).forEach((k) => {
				let count = 0
				this.pafCart[k].forEach((v) => count = count + v)
				if(count > 0)
				{
					let film = this.shop.find((a) => a.sys.id === k)
					items.push(film)
					// order['order_' + '1']
					this.pafCart[k].forEach((v, k) => {
						order['order_' + (k + 1)] =
							film.fields.title + '_' + film.fields.prices[k]['key'] + ' : ' + v
					})
				}
			})
			this.order = order
			return items
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
			this.totalAmount = total
			return total
		}

	}

	, methods: {

		checkOrder: function(){
			this.stepper = 2;
		}

		, completeConsumerInfo: function(){
			if(this.$refs.userForm.validate())
			{
				this.stepper = 3;
			}
		}

		, completeOrder: function(){

			if(this.paymentMethod == 1)
			{

				let address = this.user.zipcode + this.user.prefecture + this.user.city + this.user.address1 + this.user.address2

				let orderID = 'PAFO' + parseInt((+new Date) + Math.random()* 100).toString().slice(-6)

				const params = new URLSearchParams();
				params.append('form-name', 'order');
				params.append('orderID', orderID)
				params.append('name', this.user.name);
				params.append('address', address);
				params.append('tel', this.user.tel);
				params.append('email', this.user.email);

				this.$axios.$post('/', params)
					.then((res) => {
						this.$router.push({ name: 'shop-thanks', params: { orderID: orderID } })
					})
			}
			else
			{
				this.dialog = true
			}

		}

		, purchase: function()
		{
			this.$router.push({name: 'shop-thanks'});
		}

	}

	, created()
	{
	}

	, head() {
		return {
			title: this.title,
			script: [{ src: '//js.stripe.com/v3/' }]
		}
	}

}
</script>
