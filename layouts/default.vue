<template>
	<v-app>
		<Header></Header>
		<Navi v-if="showNavi()"></Navi>
		<v-container>
			<Nuxt></Nuxt>
		</v-container>
		<Footer></Footer>
	</v-app>
</template>

<script>
	import Header from '@/components/header'
	import Footer from '@/components/footer'
	import Navi   from '@/components/navi'

	export default
	{

		data: function()
		{
			return{
			}
		}

		, components: {
			Header, Footer, Navi
		}

		, methods: {
			showNavi: function()
			{
				return (this.$route.name.match(/shop/)) ? false : true
			}
		}

	}
</script>

<style>
</style>
