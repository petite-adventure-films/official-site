<template>
	<v-form ref="userInfoForm">
		<v-text-field
			v-model   = "user.name"
			label     = "お名前"
			:rules    = "[required]"
		></v-text-field>
		<v-text-field
			v-model = "user.zipcode"
			label   = "郵便番号"
			hint    ="半角数字のみ、'-'は不要です"
			@input   = "getAddress"
			:rules  = "[required, isZipcode]"
		></v-text-field>
		<v-text-field
			v-model   = "user.prefecture"
			label     = "都道府県"
			:rules    = "[required]"
		></v-text-field>
		<v-text-field
			v-model   = "user.city"
			label     = "市区町村"
			:rules    = "[required]"
		></v-text-field>
		<v-text-field
			v-model   = "user.address1"
			label     = "番地"
			:rules    = "[required]"
		></v-text-field>
		<v-text-field
			v-model   = "user.address2"
			label     = "建物名・号室"
		></v-text-field>
		<v-text-field
			v-model = "user.tel"
			label   = "電話番号"
			hint    ="半角数字のみ、'-'は不要です"
			:rules  = "[required, isTelnumber]"
		></v-text-field>
		<v-text-field
			v-model = "user.email"
			label   = "メールアドレス"
			:rules  = "[required, isEmail]"
			type    = "email"
		></v-text-field>
		<v-text-field
			v-model   = "user.emailConfirm"
			label     = "メールアドレス確認"
			:rules    = "[required, isEmailCorrect]"
			type      = "email"
		></v-text-field>
	</v-form>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default{

	props: ['user']

	, components: {
	}

	, data: function()
	{
		return{
			  required: val => !!val || '必ず入力してください'
			, isZipcode: val => /^\d{7}$/.test(val) || '正しい郵便番号を入力してください'
			, isTelnumber: val => /^\d{10,11}$/.test(val) || '正しい電話番号を入力してください'
			, isEmail: val => /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(val) || '正しいメールアドレスを入力してください'
			, isEmailCorrect: val => this.user.email === val || 'メールアドレスを確認してください'

		}
	}

	, computed: {
	}

	, methods: {

		async getAddress()
		{
			let url = '/zipApi/api/search?zipcode=' + this.user.zipcode
			let res = await this.$axios.$get(url)
			if(res.status === 200)
			{
				this.user.prefecture = res.results[0].address1
				this.user.city = res.results[0].address2 + res.results[0].address3
			}
		}

		, validate: function(){
			if(this.$refs.userInfoForm.validate())
			{
				return true;
			}
		}

	}

	, mounted: function()
	{
	}

	, created()
	{
	}

}
</script>