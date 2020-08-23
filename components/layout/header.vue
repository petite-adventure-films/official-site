<template>
	<header>
		{{siteName}}<br>
		{{siteNameJP}}
	</header>
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

}
</script>