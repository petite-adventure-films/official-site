<template>

	<v-container>
		<v-app>
			<Header></Header>
			<Nav></Nav>
			<Nuxt></Nuxt>
		</v-app>
	</v-container>

</template>

<script>
	import Header from '@/components/layout/header'
	import Nav from '@/components/layout/nav'

	export default
	{

		components: {
			Header, Nav
		}

		, data: function()
		{
			return{
			}
		}

	}
</script>
