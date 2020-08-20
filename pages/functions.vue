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
			, strings: ''
		}
	}

	, methods: {
	}

	, async asyncData({ $axios }){


		// let BaseURl = '/.netlify/hello'
		let baseUrl = process.env.NODE_ENV !== 'production'
				? 'http://localhost:3000'
				: process.env.URL
		let url = baseUrl + '/functions/hello'

		return $axios.get(url)
			.then((response) => {
				return {
					message: response.data
				}
			})
	}
}
</script>