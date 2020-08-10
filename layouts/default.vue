<template>
	<v-app>
		<Header></Header>
		<Navi></Navi>
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

		components: {
			Header, Footer, Navi
		}

	}
</script>

<style>
</style>
