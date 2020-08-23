<template>
	<v-card
		:to = "linkTo('media', post)"
		outlined
		class="mt-4"
		><v-card-title>
			{{post.fields.mediaName}}
			{{post.fields.mediaType}}
		</v-card-title>
		<v-card-text>
			{{post.fields.articleTitle}}<br>
			{{post.fields.mediaName}}
			{{post.fields.mediaVolume}}
			{{post.fields.releaseDate}}
		</v-card-text>
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