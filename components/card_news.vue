<template>
	<v-card
		:to  = "linkTo('news', post)"
		outlined
		class="mt-2"
		><v-card-text>
			<v-chip color="blue">お知らせ</v-chip>
			<v-chip v-if="post.fields.eventType">
				{{post.fields.eventType.fields.title}}
			</v-chip>
			<v-chip v-if="post.fields.relatedFilm">
				{{post.fields.relatedFilm.fields.titleAbbr}}
			</v-chip>
		</v-card-text>
		<v-card-title>
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