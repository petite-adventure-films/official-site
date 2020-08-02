<template>
	<div>
		<nuxt-link :to = "{name:'news'}">お知らせ</nuxt-link><br>
		<nuxt-link :to = "{name:'event'}">上映会・イベント</nuxt-link>


	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
	computed: {
		  ...mapState()
		, ...mapGetters(['linkTo'])
	}
}
</script>