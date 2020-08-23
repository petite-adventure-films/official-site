<template>
	<v-card
		:to  = "linkTo('news', post)"
		outlined
		class="mt-2"
		>
		<v-card-title>
			<v-chip v-if="post.fields.important" color="red">重要</v-chip>
			<v-chip v-if="post.fields.eventType">
				{{post.fields.eventType.fields.title}}
			</v-chip>
			<v-chip v-if="post.fields.relatedFilm">
				{{post.fields.relatedFilm.fields.titleAbbr}}
			</v-chip>
			<div>{{post.fields.title}}</div>
		</v-card-title>
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
		...mapGetters(['linkTo'])
	}


	, mounted: function()
	{
	}

	, created()
	{
	}

}
</script>