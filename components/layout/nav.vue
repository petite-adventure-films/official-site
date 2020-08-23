<template>
	<nav>
		<v-btn text :to = "{name:'index'}">HOME</v-btn>
		<v-btn text :to = "{name:'news'}">新着情報</v-btn>
		<v-btn text :to = "{name:'events'}">上映会・イベント</v-btn>
		<v-btn text :to = "{name:'films'}">映画</v-btn>
		<v-btn text :to = "{name:'channel'}">チャンネル</v-btn>
		<v-btn text :to = "{name:'media'}">メディア紹介</v-btn>
		<!-- <v-btn text :to = "{name:'director'}">監督</v-btn>
		<v-btn text :to = "{name:'four_walling'}">自主上映</v-btn>
		<v-btn text :to = "{name:'workshop'}">ワークショップ</v-btn>
		<v-btn text :to = "{name:'kawaraban'}">かわら版</v-btn> -->
	</nav>
</template>

<style>
	nav{
		margin-bottom: 12px;
		padding-bottom: 12px;
		border-bottom: 1px solid #eeeeee;
	}
</style>