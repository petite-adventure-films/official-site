<template>
	<div @click="goHome()">
		{{siteName}}<br>
		{{siteNameJP}}
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