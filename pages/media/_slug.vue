<template>
    <article>

        {{fields.mediaName}} {{fields.mediaType}} {{fields.mediaVolume}} {{fields.releaseDate}}<br>
        <span v-if="fields.articleTitle">{{fields.articleTitle}}</span>
        <span v-if="fields.articleSubtitle">{{fields.articleSubtitle}}</span></div>

        <canvas v-if="hasPdf" ref="pdfCanvas"></canvas>

        <youtube
        v-if="fields.youtubeVideoId"
            :video-id="fields.youtubeVideoId"></youtube>

        <div v-html="renderRichText(fields.body)"></div>

        <div v-if="fields.articleTitle && hasRichTextContents(fields.articleBody)">
            <h3>記事本文</h3>
            <h4>{{fields.articleTitle}}</h4>
            <h5>{{fields.articleSubtitle}}</h5>
            <div v-html="renderRichText(fields.articleBody)"></div>
        </div>

    </article>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import cttfClient from '@/plugins/contentful'
import PDFJS from 'pdfjs-dist/build/pdf'

export default {

    data: function()
    {
        return{
            hasPdf: false
        }
    }

    , computed: {
        ...mapGetters(['linkTo', 'dateFormat', 'renderRichText'])
        , fields: function(){ return this.post.fields || {} }
        , sys: function(){ return this.post.sys || {} }
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
    }

    , created()
    {
        let self = this;

        if(this.post.fields.media && this.post.fields.media.fields.file.contentType == 'application/pdf')
        {
            this.hasPdf = true;
            PDFJS.GlobalWorkerOptions.workerSrc = './pdfjs-dist/build/pdf.worker.js';
            let loadingTask = PDFJS.getDocument({
                url: this.post.fields.media.fields.file.url
                , cMapUrl: './pdfjs-dist/cmaps/'
                , cMapPacked: true,
            });

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

    
    , async asyncData({ payload, store, params, error }) {
        const post = await store.state.media.find(post => post.fields.slug === params.slug)
            || await cttfClient.getEntries({
                  content_type: 'media'
                , 'fields.slug' : params.slug
            });

        if (post) {
            return { post: post.items ? post.items[0] : post }
        } else {
            return error({ statusCode: 400 })
        }
    }
    
}
</script>