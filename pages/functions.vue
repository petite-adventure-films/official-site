<template>
 <div class="container">
	<h2 v-text="'Netlify Functions × Nuxt.js サンプル'" />
	<p v-text="message" />
 </div>
</template>

<script>

export default {

	data: function()
	{
		return {
			message: ''
		}
	}
	, async asyncData({ $axios }){

		console.log('prod', process.env.NODE_ENV)
		console.log('prod', process.env)
		// const baseUrl =
		// 	process.env.NODE_ENV !== 'production'
		// 		? 'http://localhost:9000'
		// 		: 'https://old-state--dreamy-goldberg-f608e5.netlify.app'

		// return $axios.get(baseUrl + '/.netlify/functions/hello').then((response) => {
		// 	return {
		// 		message: response.data
		// 	}
		// })
	}
}
</script>