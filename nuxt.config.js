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
		  '@/plugins/components'
		, '@/plugins/contentful'
		, '@/plugins/vue-youtube'
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
		'@nuxtjs/vuetify',
	],
	/*
	** Nuxt.js modules
	*/
	modules: [
		// Doc: https://axios.nuxtjs.org/usage
		'@nuxtjs/axios',
		'@nuxtjs/dotenv'
	],
	/*
	** Axios module configuration
	** See https://axios.nuxtjs.org/options
	*/
	axios: {},
	/*
	** Build configuration
	** See https://nuxtjs.org/api/configuration-build/
	*/
	build: {
	}
	/*
	** env configuration
	*/
	, env: {
		// contentful
		  CTF_SPACE_ID             : process.env.CTF_SPACE_ID
		, CTF_CDA_ACCESS_TOKEN     : process.env.CTF_CDA_ACCESS_TOKEN
		, CTF_PREVIEW_ACCESS_TOKEN : process.env.CTF_PREVIEW_ACCESS_TOKEN
		, BASE_URL                 : process.env.BASE_URL || 'http://localhost:3000'
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
