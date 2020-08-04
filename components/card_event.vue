<template>
	<v-card
		:to  = "linkTo('event', post)"
		outlined
		class="mt-4"
		><v-card-text v-if="post.fields.eventType || post.fields.relatedFilm">
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
		<v-card-text class="text--primary">
			<div>
				{{post.fields.startDate}}
				<span v-if="post.fields.endDate">
					~ {{post.fields.endDate}}
				</span>
			</div>
			<div>
				{{post.fields.place}}<br>
				{{post.fields.address}}
			</div>
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


	, mounted: function()
	{
	}

	, created()
	{
	}

}
</script>