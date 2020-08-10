<template>
	<div class="navi">
		<v-btn text :to = "{name:'news'}">お知らせ</v-btn>
		<v-btn text :to = "{name:'event'}">上映会・イベント</v-btn>
		<v-btn text :to = "{name:'film'}">映画</v-btn>
		<v-btn text :to = "{name:'channel'}">チャンネル</v-btn>
		<v-btn text :to = "{name:'media'}">メディア紹介</v-btn>
		<v-btn text :to = "{name:'director'}">監督</v-btn>
		<v-btn text :to = "{name:'four_walling'}">自主上映</v-btn>
		<v-btn text :to = "{name:'workshop'}">ワークショップ</v-btn>
		<v-btn text :to = "{name:'blog'}">かわら版</v-btn>
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
			// loadedData: null
			// logdata: {}
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
			// this.$router.push({ name: 'index', params: {} });
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


<style>
	.navi{
		margin-top: 12px;
		border-top: 1px solid #dddddd;
		border-bottom: 1px solid #dddddd;
		background: #eeeeee;
	}
</style>