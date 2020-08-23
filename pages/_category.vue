<template>
    <article>
		かわら版 - {{pageTitle}}

        <cardPost
        v-for="item in post"
        :key="'categoryPost' + item.sys.id"
            :post="item"></cardPost>
		<br>
		<v-btn v-if="loadMore" @click="viewMore">もっと見る</v-btn>

    </article>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { createClient } from '@/plugins/contentful'

import cardPost from '@/components/card_post'

const client = createClient();

export default {


    components:{
        cardPost
    }

    , data: function()
    {
        return{
            pageTitle : this.$route.params.category
        }
    }

    , computed:
    {
        ...mapState(['category', 'series', 'pageInfo'])
        , ...mapGetters(['linkTo', 'dateFormat'])
        , loadMore: function(){
            let loaded = this.postPageInfo;
            return (loaded.skip + loaded.limit < loaded.total);
        }
        , addBreads: function(){
            return [
                {
                    icon: 'mdi-folder-outline'
                    , text: 'かわら版'
                    , to: {name: 'blog'}
                }
                , {
                    icon: 'mdi-folder-outline'
                    , text: this.$route.params.category
                    , to: {name: 'category', params: { category: this.$route.params.category } }
                }
            ]
        }
    }

    , methods:
    {

        async viewMore()
        {

            let loaded = this.postPageInfo.skip + 100;

            let result = await client.getEntries({
                content_type: 'post'
                , skip: loaded
                , limit: this.postPageInfo.limit
                , order: '-fields.publishedDate,-fields.order,-sys.createdAt'
                , 'fields.category.sys.contentType.sys.id': 'category'
                , 'fields.category.fields.title[match]': this.$route.params.category
            });

            if (result){
                this.postPageInfo.skip = result.skip;
                result.items.forEach((arr, key) => {
                    this.post.push(arr);
                })
            }

        }

    }


    , async asyncData({ payload, store, params, error }) {
        const post = await client.getEntries({
                  content_type: 'post'
                , order: '-fields.publishedDate,-fields.order,-sys.createdAt'
                , 'fields.category.sys.contentType.sys.id': 'category'
                , 'fields.category.fields.title[match]': params.category
            });

        if (post) {
            return {
                  post: post.items ? post.items : post
                , postPageInfo: {
                      total : post.total
                    , skip  : post.skip
                    , limit : post.limit
                }
            }

        } else {
            return error({ statusCode: 400 })
        }
    }

}
</script>