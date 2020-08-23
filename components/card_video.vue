<template>
	<v-card
		:to = "linkTo('channel', post)"
		outlined
		class="mt-4"
		>
		<v-img
			class="white--text align-end"
			height="200px"
			:src="getThumbImg(post.fields.youtubeVideoId)"
			><v-card-title>{{post.fields.title}}</v-card-title>
			<v-card-text>
				{{post.fields.country}} / {{post.fields.releaseYear}} / {{post.fields.runningTime}}
			</v-card-text>
		</v-img>
	</v-card>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default{

	props: ['post']

	, components: {
	}

	, data: function()
	{
		return{
		}
	}

	, computed: {
		...mapGetters(['linkTo', 'dateFormat'])
	}

	, methods: {
		getThumbImg(id)
		{
			return 'https://i.ytimg.com/vi/' + id + '/mqdefault.jpg';
		}
	}

	, mounted: function()
	{
	}

	, created()
	{
	}

}
</script>