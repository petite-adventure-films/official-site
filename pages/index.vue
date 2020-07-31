<template>
	<div>
		<nuxt-link :to = "{name:'news'}">News</nuxt-link><br>
		<nuxt-link :to = "{name:'event'}">Events</nuxt-link>


	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
	computed: {
		  ...mapState(['posts', 'categories'])
		, ...mapGetters(['linkTo'])
	}
}
</script>