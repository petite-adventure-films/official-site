require('dotenv').config()

export default {
	/*
	** Nuxt rendering mode
	** See https://nuxtjs.org/api/configuration-mode
	*/
	mode: 'universal',
	/*
	** Nuxt target
	** See https://nuxtjs.org/api/configuration-target
	*/
	target: 'server',
	/*
	** Headers of the page
	** See https://nuxtjs.org/api/configuration-head
	*/
	head: {
		title: process.env.SITE_NAME || '',
		meta: [
			{ charset: 'utf-8' },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
			{ hid: 'description', name: 'description', content: process.env.SITE_DESCRIPTION || '' }
		]
		, script: [
		]
		, link: [
			{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
		]
	},
	/*
	** Global CSS
	*/
	css: [
	],
	/*
	** Plugins to load before mounting the App
	** https://nuxtjs.org/guide/plugins
	*/
	plugins: [
		  '@/plugins/contentful'
		, '@/plugins/components'
		, '@/plugins/vue-youtube'
		, { src: '@/plugins/persistedstate.js', ssr: false }
	],
	/*
	** Auto import components
	** See https://nuxtjs.org/api/configuration-components
	*/
	components: true,
	/*
	** Nuxt.js dev-modules
	*/
	buildModules: [
		'@nuxtjs/vuetify'
	],
	/*
	** Nuxt.js modules
	*/
	modules: [
		// Doc: https://axios.nuxtjs.org/usage
		'@nuxtjs/axios'
		, '@nuxtjs/proxy'
		, '@nuxtjs/dotenv'
	]
	/*
	** Axios module configuration
	** See https://axios.nuxtjs.org/options
	*/
	, axios: {
		  baseURL: process.env.DEPLOY_PRIME_URL || 'http://localhost:3000'
		, browserBaseURL: process.env.DEPLOY_PRIME_URL || 'http://localhost:3000'
	}
	/*
	** Proxy module configuration
	*/
	, proxy: {
		// '/functions/': {
		// 	  target: (process.env.URL || 'http://localhost:9000') + '/.netlify/functions/hello'
		// 	// , pathRewrite: {'^/.netlify': ''}
		// }
		'/zipApi/': {
			  target: 'https://zipcloud.ibsnet.co.jp'
			, pathRewrite: {'^/zipApi/': ''}
		}
	}
	/*
	** Build configuration
	** See https://nuxtjs.org/api/configuration-build/
	*/
	, build: {
		extend: ({ module, output }) => {
			module.rules.unshift({
				test: /\.worker\.js$/,
				loader: 'worker-loader'
			})
			output.globalObject = 'this'
		}
	}
	/*
	** env configuration
	*/
	, env: {
		  CTF_SPACE_ID             : process.env.CTF_SPACE_ID
		, CTF_CDA_ACCESS_TOKEN     : process.env.CTF_CDA_ACCESS_TOKEN
		, CTF_PREVIEW_ACCESS_TOKEN : process.env.CTF_PREVIEW_ACCESS_TOKEN
		, STRIPE_PUBLIC_KEY : process.env.STRIPE_PUBLIC_KEY
		, STRIPE_SECRET_KEY : process.env.STRIPE_SECRET_KEY
		, FUNCTION_URL : process.env.DEPLOY_PRIME_URL || 'http://localhost:9000'
		, OAUTH_USER : process.env.OAUTH_USER
		, OAUTH_CLIENT_ID : process.env.OAUTH_CLIENT_ID
		, OAUTH_CLIENT_SECRET : process.env.OAUTH_CLIENT_SECRET
		, OAUTH_REFRESH_TOKEN : process.env.OAUTH_REFRESH_TOKEN
	}
	/*
	** router configuration
	*/
	, router: {
		base: process.env.BASE_DIR || '/'
		, middleware: [
			'getContentful'
		]
	}

}
