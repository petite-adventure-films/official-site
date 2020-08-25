<template>

	<v-container>
		<v-app>
			<Header></Header>
			<Nav></Nav>
			<Nuxt></Nuxt>
			<Footer></Footer>
		</v-app>
	</v-container>

</template>

<script>
	import Header from '@/components/layout/header'
	import Nav from '@/components/layout/nav'
	import Footer from '@/components/layout/footer'

	export default
	{

		components: {
			Header, Nav, Footer
		}

		, data: function()
		{
			return{
			}
		}

		, methods: {
			showNavi: function()
			{
				return (this.$route.name.match(/shop/)) ? false : true
			}
		}

	}
</script>
