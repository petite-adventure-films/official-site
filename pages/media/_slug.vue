<template>
	<div>
		<h3>{{post.fields.mediaName}} {{post.fields.mediaType}}</h3>

		<canvas v-if="hasPdf" ref="pdfCanvas"></canvas>
		<youtube
		v-if="post.fields.youtubeVideoId"
			:video-id="post.fields.youtubeVideoId"></youtube>

		<div v-html="renderRichText(post.fields.body)"></div>

		<div v-if="post.fields.articleTitle && hasRichTextContents(post.fields.articleBody)">
			<h3>記事本文</h3>
			<h4>{{post.fields.articleTitle}}</h4>
			<h5>{{post.fields.articleSubtitle}}</h5>
			<div v-html="renderRichText(post.fields.articleBody)"></div>
		</div>


		<nuxt-link :to="{name:'media'}">←メディア紹介</nuxt-link><br>
		<nuxt-link :to="{name:'index'}">←HOME</nuxt-link>
	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {

	async asyncData({ payload, store, params, error }) {
		const post = payload
			|| await store.state.media.find(post => post.fields.slug === params.slug);
		if (post) {
			return { post }
		} else {
			return error({ statusCode: 400 })
		}
	}

	, data: function()
	{
		return{
			hasPdf: false
		}
	}

	, components: {
	}

	, computed: {
		...mapGetters(['linkTo', 'dateFormat', 'renderRichText'])
	}

	, methods: {

		hasRichTextContents: function(data)
		{
			console.log('ddd', data.content[0].content[0].value);
			return (data.content[0].content[0].value) ? true : false;

		}

	}

	, created()
	{
		let self = this;

		if(this.post.fields.media)
		{

			if(this.post.fields.media.fields.file.contentType === 'application/pdf')
			{
				let pdf = this.post.fields.media.fields.file.url;
				var loadingTask = pdfjsLib.getDocument(pdf);
				loadingTask.promise.then(function(doc) {

					let canvas = self.$refs.pdfCanvas;
					let context = canvas.getContext('2d');

					doc.getPage(1).then(page => {
						let viewport = page.getViewport({scale: 1});
						canvas.width = viewport.width;
						canvas.height = viewport.height;

						page.render({
							  canvasContext: context
							, viewport: viewport
						})

					})
				});
			}

		}
	}

}
</script>