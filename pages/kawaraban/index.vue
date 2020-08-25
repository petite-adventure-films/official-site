<template>
    <article>
        <cardPost
        v-for = "item in post"
        :key = "'wakaraban' + item.sys.id"
            :post="item"></cardPost>
    </article>
</template>


<script>
import { mapState, mapGetters } from 'vuex'
import cttfClient from '@/plugins/contentful'
import cardPost from '@/components/card_post'

export default {

    components:{
        cardPost
    }

    , data: function()
    {
        return{
        }
    }

    , computed:
    {
        ...mapState(['category', 'series', 'pageInfo', 'post'])
        , ...mapGetters(['linkTo', 'dateFormat'])
        , postPageInfo: function(){
            return this.pageInfo['post']
        }
        , loadMore: function(){
            let loaded = this.postPageInfo;
            return loaded.skip + loaded.limit < loaded.total;
        }
        , addBreads: function(){
            return [
                {
                    icon: 'mdi-folder-outline'
                    , text: 'かわら版'
                    , to: {name: 'blog'}
                }
            ]
        }

    }

    , methods:
    {

        async viewMore()
        {

            let loaded = this.postPageInfo.skip + 20;

            let result = await cttfClient.getEntries({
                content_type: 'post'
                , skip: loaded
                , limit: this.postPageInfo.limit
                , order: '-fields.publishedDate,-fields.order,-sys.createdAt'
            });

            if (result){
                this.$store.commit('setPageInfo', result);
                result.items.forEach((arr, key) => {
                    this.$store.commit('setPosts', arr);
                })
            }
        }


    }

    , async asyncData({ payload, store, params, error }) {
        
        const result = payload
            || (store.state.post.length > 0) ? store.state.post
                : await cttfClient.getEntries({
                    content_type: 'post'
                    , order: '-fields.publishedDate,-fields.order,-sys.createdAt'
                    , limit: 20
                });

        if (result) {

            if(result.items)
            {
                store.commit('setPosts', result)
                store.commit('setPageInfo', result)

            }
            
        } else {
            return error({ statusCode: 400 })
        }

    }

}
</script>