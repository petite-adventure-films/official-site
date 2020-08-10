<template>
	<article>

		<header>
			<breadcrumbs :addItems="addBreads"></breadcrumbs>
			<h1>{{post.fields.mediaName}} {{post.fields.mediaType}} {{post.fields.mediaVolume}} {{post.fields.releaseDate}}</h1>
			<div><span v-if="post.fields.articleTitle">{{post.fields.articleTitle}}</span> <span v-if="post.fields.articleSubtitle">{{post.fields.articleSubtitle}}</span></div>
		</header>

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

	</article>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { createClient } from '@/plugins/contentful'
import PDFJS from 'pdfjs-dist/build/pdf'

// console.log(PDFJSWorker)


const client = createClient();

export default {

	async asyncData({ payload, store, params, error }) {
		const post = payload
			|| await store.state.media.find(post => post.fields.slug === params.slug)
			|| await client.getEntries({
					content_type: 'media'
				, 'fields.slug' : params.slug
			});


		if (post) {
			return { post: post.items ? post.items[0] : post }
		} else {
			return error({ statusCode: 400 })
		}
	}

	, components: {
	}
	, data: function()
	{
		return{
			hasPdf: false
			// , pdfJS: {}
			, pdfFile: {}
		}
	}

	, computed: {
		...mapGetters(['linkTo', 'dateFormat', 'renderRichText'])

		, addBreads: function(){
			return [
				{
						icon: 'mdi-folder-outline'
					, text: 'メディア紹介'
					, to: { name: 'media'}
				}
				, {
					text: this.post.fields.title
					, to: this.linkTo('media', this.post)
				}
			]
		}


	}

	, methods: {

		hasRichTextContents: function(data)
		{
			if(!data) return false;
			return (data.content[0].content[0].value) ? true : false;
		}

		, viewPdf: function(data)
		{


getPDFJSWorker();
 async function getPDFJSWorker(){
	let res = await import('pdfjs-dist/build/pdf.worker');
	if(res)
	{
		PDFJS.GlobalWorkerOptions.workerSrc = 'http://mozilla.github.io/pdf.js/build/pdf.worker.js';
		// PDFJS.workerSrc = res;




			var loadingTask = PDFJS.getDocument({
				  url: data
				, cMapUrl: '/cmaps/'
				, cMapPacked: true,
			});
	}
}
			// loadingTask.promise.then(function(doc) {
			// console.log('laodin', doc)

			// 		let canvas = self.$refs.pdfCanvas;
			// 		let context = canvas.getContext('2d');

			// 		doc.getPage(1).then(page => {
			// 			let viewport = page.getViewport({scale: 1});
			// 			canvas.width = viewport.width;
			// 			canvas.height = viewport.height;

			// 			page.render({
			// 				  canvasContext: context
			// 				, viewport: viewport
			// 			})

			// 		})
			// 	});
		}

	}

	, created()
	{

		let self = this;

			// const PDFJSWorker = ;
		if(this.post.fields.media
		&& this.post.fields.media.fields.file.contentType === 'application/pdf')
		{
			this.hasPdf = true;

			let pdf = this.post.fields.media.fields.file.url;
			let getFileBlob = new Promise((resolve, reject) =>
			{
				let request = new XMLHttpRequest();
				request.open('GET', pdf, true);
				request.responseType = 'blob';
				request.onload = function(){
					resolve(request.response);
				}
				request.send();
			});

			getFileBlob.then((r) => {
				let reader = new FileReader()
				reader.readAsArrayBuffer(r)
				reader.onload = () => {
					self.pdfFile = reader.result;
					this.viewPdf(reader.result);
				}
			});

		}
	}

}
</script>
