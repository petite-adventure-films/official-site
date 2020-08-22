<template>
	<v-stepper v-model="stepper" vertical non-linear>

		<!-- //////////////////////////////////////////////////////////////・ -->
		<!-- 注文内容確認 -->
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

		<!-- //////////////////////////////////////////////////////////////・ -->
		<!-- 購入者情報 -->
		<v-stepper-step :complete="stepper > 2" step="2" editable>購入者情報</v-stepper-step>
		<v-stepper-content step="2">
			<cartUser ref="userForm" :user="user" :agreement="agreementPost"></cartUser>
			<v-btn block color="purple" class="mt-2" @click="completeConsumerInfo">次へ進む</v-btn>
		</v-stepper-content>
		<div class="ml-15" v-if="stepper > 2">
			{{user.name}}<br>
			{{user.zipcode}} {{user.prefecture}}{{user.city}}{{user.address1}}<br>
			{{user.address2}}<br>
			{{user.tel}}<br>
			{{user.email}}<br>
			<div v-if="user.receipt">
				領収書必要<br>
				お宛名 {{user.receiptName}} 但し書き {{user.receiptDescription}}
			</div>
		</div>

		<!-- //////////////////////////////////////////////////////////////・ -->
		<!-- 購入者情報 -->
		<v-stepper-step :complete="stepper > 3" step="3" editable>決済情報</v-stepper-step>
		<v-stepper-content step="3">

			<v-radio-group v-model="paymentMethod" :mandatory="false" :rules="[required]">
				<v-radio label="銀行振込" value="1"></v-radio>
				<div v-if="paymentMethod == 1">
					振込先情報は購入完了メールに記載されております。<br>振込手数料はご負担下さい。
				</div>
				<v-radio label="クレジットカード" value="2"></v-radio>
				<div v-if="paymentMethod == 2">
					注文確定後、クレジットカード決済画面に移動します。
				</div>
			</v-radio-group>

			<v-dialog v-model="dialog" fullscreen hide-overlay transition="dialog-bottom-transition">
				<v-card>
					<v-btn icon @click="dialog = false">
						<v-icon>mdi-close</v-icon>
					</v-btn>

					<card
						:options="stripeOptions"
						:stripe="stripePK"
						class="stripe"
						@change="isEntered = $event.complete"
					></card>
					<v-btn block color="purple" class="mt-2" @click="pay">決済</v-btn>
					{{payErrorMessage}}

				</v-card>
			</v-dialog>

			<v-form name="order" method="POST" data-netlify="true" data-netlify-honeypot="bot-field">
				<input type="hidden" name="form-name" value="contact">
				<input type="hidden" name="bot-field">
				<input type="hidden" name="orderID">
				<input type="hidden" name="name">
				<input type="hidden" name="address">
				<input type="hidden" name="tel">
				<input type="hidden" name="email">
				<input type="hidden" name="receipt" :value="(user.receipt) ? '必要' : '不要'">
				<input v-if="(user.receipt)" type="hidden" name="receiptName" :value="(user.receiptName) ? user.receiptName : '-'">
				<input v-if="(user.receipt)" type="hidden" name="receiptDescription" :value="(user.receiptDescription) ? user.receiptDescription : '-'">
				<input type="hidden" name="orderDetails">
				<input type="hidden" name="paymentMethod">
				<input type="hidden" name="total">
				<v-btn block color="purple" class="mt-2" @click="completeOrder">注文確定</v-btn>
			</v-form>

		</v-stepper-content>

	</v-stepper>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import cart from '@/components/cart'
import cartUser from '@/components/cart_user'

import { createClient } from '@/plugins/contentful'
import { Card, createToken } from 'vue-stripe-elements-plus'

export default {

	components: {
		cart, cartUser, Card
	}

	, data: function()
	{
		return{
			stepper: 1
			, dialog: false
			, inRegister: true
			, orderDetails: ''

			// 購入者情報フォーム
			, user: {
				  name: ''
				, zipcode: ''
				, prefecture: ''
				, city: ''
				, address1: ''
				, address2: ''
				, tel: ''
				, email: ''
				, emailConfirm: ''
				, receipt : false
				, receiptName : ''
				, receiptDescription : ''
				, orderID: 'PAFO' + parseInt((+new Date) + Math.random()* 100).toString().slice(-6)
			}

			// 決済手段
			, paymentMethod : 0
			, required: val => !!val || '必ず入力してください'

			// カード番号入力
			, stripeOptions: { hidePostalCode: true }
			, stripePK: process.env.STRIPE_PUBLIC_KEY
			, isEntered: false
			, payErrorMessage: ''

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
			let details = ''
			Object.keys(this.pafCart).forEach((k) => {
				let count = 0
				this.pafCart[k].forEach((v) => count = count + v)
				if(count > 0)
				{
					let film = this.shop.find((a) => a.sys.id === k)
					items.push(film)
					this.pafCart[k].forEach((v, k2) => {
						if(v > 0){
							details = details + `${film.fields.title}[${film.fields.prices[k2]['key']}] : ${v}\n`
						}
					})
				}
			})

			if(items.length > 0)
			{
				this.orderDetails = details
				return items
			}

			else
			{
				this.$router.push({ name: 'shop' })
			}
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
				this.sendOrderForm()
				this.emptyCart()
			}
			else
			{
				this.dialog = true
			}

		}

		, sendOrderForm: function()
		{
			let address = this.user.zipcode + this.user.prefecture + this.user.city + this.user.address1 + this.user.address2

			const params = new URLSearchParams();
			params.append('form-name', 'order');
			params.append('orderID', this.user.orderID);
			params.append('name', this.user.name);
			params.append('address', address);
			params.append('tel', this.user.tel);
			params.append('email', this.user.email);
			params.append('receipt', (this.user.receipt) ? '必要' : '不要');
			if(this.user.receipt)
			{
				params.append('receiptName', this.user.receiptName);
				params.append('receiptDescription', this.user.receiptDescription);
			}
			params.append('orderDetails', this.orderDetails);
			params.append('paymentMethod', (this.paymentMethod == 1) ? '振込' : 'クレジットカード');
			params.append('total', new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(this.total));

			this.$axios.$post('/', params)
				.then((res) => {
					this.$router.push({ name: 'shop-thanks', params: { orderID: this.user.orderID } })
				})
		}

		, async pay() {

			let self = this

			try {

				// 決済用トークン発行
				const tokenResult = await createToken()
				if (
					!tokenResult ||
					!tokenResult.token ||
					!tokenResult.token.id ||
					tokenResult.token.id === ''
				) {
					throw new Error('トークン発行エラー')
				}

				// 決済処理
				const chargeResult = await this.$axios.post(
					`${process.env.FUNCTION_URL}/.netlify/functions/charge`,
					{
						  amount: this.total
						, token: tokenResult.token.id
						, orderID: this.user.orderID
					}
				)

				if (!chargeResult || chargeResult.data !== 'NORMAL') {
					throw new Error('決済エラー')
				}

				this.sendOrderForm();
				this.emptyCart()

			} catch (error) {
				this.payErrorMessage = error.message + 'が発生しました。'
			}
		}

		, emptyCart: function()
		{
			this.$store.commit('emptyCart')
			this.$store.commit('setCartCount', 0)
		}

	}

	, created()
	{
	}

	, async asyncData({ payload, store, params, error }){

		const result = await createClient().getEntries({
				  content_type: 'page'
				, 'fields.slug' : 'gathering-the-personal-information'
			});

		if(result)
		{
			return { agreementPost: result.items[0] }
		}
	}

	, head() {
		return {
			script: [{ src: '//js.stripe.com/v3/' }]
		}
	}

}
</script>
