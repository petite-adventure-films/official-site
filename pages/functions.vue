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

	, methods: {
	}

	, async asyncData({ $axios }){

		// return {
		// 	strings: JSON.stringify(process.env)
		// }
		let baseUrl = process.env.NODE_ENV !== 'production'
				? 'http://localhost:3000'
				: process.env.URL
		let url = baseUrl + '/.netlify/functions/hello'

		return $axios.get(url)
			.then((response) => {
				return {
					  // env: process.env
					message: response.data
				}
			})
	}
}
</script>