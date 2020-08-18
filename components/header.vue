<template>
	<div>

		<div @click="goHome()">
			{{siteName}}<br>
			{{siteNameJP}}
		</div>

		<div v-if="isShop">
			<v-btn outlined color="purple" :to="{name:'shop-cart'}">
				<v-icon>mdi-shop</v-icon>
				CART
				{{pafCartCount}}
			</v-btn>
		</div>

		<div v-else>
			<v-btn outlined color="purple" :to="{name:'shop'}">
				<v-icon>mdi-shop</v-icon>
				SHOP
			</v-btn>
		</div>

	</div>
</template>

<script>

import { mapActions, mapState, mapGetters } from 'vuex';

export default{

	props: ['']

	, components: {
	}

	, data: function()
	{

		return{
			siteName: process.env.SITE_NAME
			, siteNameJP: process.env.SITE_NAME_JP
		}

	}

	, computed:
	{
		...mapState(['pafCartCount', 'pafCart'])
		, isShop: function()
		{
			return (this.$route.name.match(/shop/)) ? true : false
		}
	}

	, methods: {

		goHome()
		{
			// this.$nuxt.$emit('updateHeader',  {isLogSinglePage: false, title: 'Logbook'});
			// this.$nuxt.$emit('updateLogdata', {});
			this.$router.push({ name: 'index', params: {} });
		}

	}

	, created()
	{
	}

	, mounted: function()
	{
	}

}
</script>