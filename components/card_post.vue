<template>
	<v-card
		:to = "linkTo(this.thisType, post)"
		outlined
		class="mt-4"
		>
		<v-img
		v-if="post.fields.thumbnail"
			class="white--text align-end"
			height="200px"
			:src="getThumbImg(post.fields.thumbnail.fields.file.url)"
			><v-card-title>
				<v-chip v-if="post.fields.category">{{post.fields.category.fields.titleAbbr}}</v-chip>
				<v-chip v-if="post.fields.relatedFilm">{{post.fields.relatedFilm.fields.titleAbbr}}</v-chip>
				<v-chip v-if="post.fields.relatedSeries">#{{post.fields.relatedSeries.fields.titleAbbr}}</v-chip>
				<div>{{post.fields.title}}</div>
			</v-card-title>
		</v-img>

		<v-card-title v-else>
			<v-chip v-if="post.fields.category">{{this.categoryAbbrName}}</v-chip>
			<v-chip v-if="post.fields.relatedFilm">{{post.fields.relatedFilm.fields.titleAbbr}}</v-chip>
			<v-chip v-if="post.fields.relatedSeries">#{{post.fields.relatedSeries.fields.titleAbbr}}</v-chip>
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
		...mapGetters(['linkTo', 'dateFormat'])
		, thisType: function()
		{
			let type = this.post.sys.contentType.sys.id;
			if(type == 'post')  type = 'blog';
			if(type == 'video') type = 'channel';
			return type;
		}
		, categoryAbbrName: function()
		{
			let category = this.$store.state.category.find((e) => e.sys.id === this.post.fields.category.sys.id);
			return category.fields.titleAbbr
		}
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