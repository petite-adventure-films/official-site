<template>
	<div class="footer">
		<v-btn text small :to="{name: 'copyrights-disclaimers'}">サイトのご利用について</v-btn>
		<v-btn text small :to="{name: 'gathering-the-personal-information'}">個人情報の扱いについて</v-btn>
		<v-btn text small :to="{name: 'privacy-policy'}">プライバシーポリシー</v-btn>
		<v-btn text small :to="{name: 'system-requirements'}">推奨環境</v-btn><br>
		Copyright © {{thisYear}} {{siteName}}. All rights reserved.
	</div>
</template>

<script>

import { mapActions, mapState, mapGetters } from 'vuex';

export default{

	props: []

	, components: {
	}

	, data: function()
	{

		return{
			  thisYear: new Date().getFullYear()
			, siteName: process.env.SITE_NAME
		}

	}

	, computed:
	{
	}

	, methods: {
	}

	, mounted: function()
	{
	}

	, created()
	{
	}

	, watch:
	{
	}


}
</script>

<style>
	.footer{
		margin-top: 12px;
		border-top: 1px solid #dddddd;
	}
</style>