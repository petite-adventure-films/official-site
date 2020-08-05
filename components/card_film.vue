<template>
	<v-card
		:to  = "linkTo('film', post)"
		outlined
		class="mt-4"
			><v-img
			class="white--text align-end"
			height="200px"
			:src="getThumbImg(post.fields.poster.fields.file.url)"
			></v-img>
			<v-card-title>{{post.fields.title}}</v-card-title>
			<v-card-text>
				{{post.fields.country}} / {{post.fields.releaseYear}} / {{post.fields.runningTime}}
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
		getThumbImg(path)
		{
			return path + '?fit=thumb';
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