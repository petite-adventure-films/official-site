<template>
	<div>
		<h1>お知らせ</h1>
		<br><br>
		<div
		v-for = "post in news"
		:key  = "post.sys.id"
			><div>
				<v-chip>{{post.fields.eventType.fields.name}}</v-chip><br>
				<nuxt-link :to="linkTo('news', post)">{{post.fields.title}}</nuxt-link><br>
				Posted {{dateFormat(post.sys.createdAt)}}
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
		  ...mapState(['news'])
		, ...mapGetters(['linkTo', 'dateFormat'])
	}

	, created: () => {
	}

}
</script>