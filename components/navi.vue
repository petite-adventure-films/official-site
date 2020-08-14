<template>
	<div class="navi">
		<v-btn text :to = "{name:'news'}">新着情報</v-btn>
		<v-btn text :to = "{name:'event'}">上映会・イベント</v-btn>
		<v-btn text :to = "{name:'film'}">映画</v-btn>
		<v-btn text :to = "{name:'channel'}">チャンネル</v-btn>
		<v-btn text :to = "{name:'media'}">メディア紹介</v-btn>
		<v-btn text :to = "{name:'director'}">監督</v-btn>
		<v-btn text :to = "{name:'four_walling'}">自主上映</v-btn>
		<v-btn text :to = "{name:'workshop'}">ワークショップ</v-btn>
		<v-btn text :to = "{name:'blog'}">かわら版</v-btn>

		<div class="kawaraban_navi">
			<v-btn
			v-for = "(item, key) in category"
			:key = "item.sys.id"
				text class="mt-1" :to = "linkTo('category', item)">{{item.fields.titleAbbr}}</v-btn>
			</v-btn>
			<div>
				<v-btn text :to="{name: 'series-recommend'}">おすすめ</v-btn>
				<v-btn
				v-for = "(item, key) in series"
				:key = "item.sys.id"
					v-if="item.fields.frontLine"
						:to = "linkTo('category', item)"
						text
						class="mt-1">{{item.fields.titleAbbr}}</v-btn>
				<v-btn text :to="{name: 'series'}">連載記事一覧</v-btn>
			</div>
		</div>
	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

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
		...mapState(['category', 'series'])
		, ...mapGetters(['linkTo', 'dateFormat'])
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
	.kawaraban_navi{
		border-top: 1px solid #dddddd;
	}
</style>