<template>
	<div>
		<h1>映画</h1>
		<br><br>
		<div
		v-for = "post in film"
		:key  = "post.sys.id"
			><div>
				<nuxt-link :to="linkTo('film', post)">{{post.fields.title}}</nuxt-link><br>
			</div>
		</div>
		<br><br>
		<nuxt-link :to="{name:'index'}">←HOME</nuxt-link>
	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
	transition: 'slide-left',

	computed: {
		  ...mapState(['film'])
		, ...mapGetters(['linkTo', 'dateFormat'])
	}

	, created: () => {
	}

}
</script>