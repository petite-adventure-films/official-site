<template>
    <article>

        <cardNews
        v-for = "post in news"
        :key  = "post.sys.id"
            :post="post"></cardNews>
        <v-btn v-if="loadMore" @click="viewMore">もっと見る</v-btn>

    </article>
</template>


<script>
import { mapState, mapGetters, mapMutations } from 'vuex'
import cardNews from '@/components/card_news'

import cttfClient from '@/plugins/contentful'


export default {

    components: {
        cardNews
    }

    , data: function()
    {
        return{
        }
    }


    , computed: {
        ...mapState(['news', 'pageInfo'])
        , thisPageInfo: function(){ return this.pageInfo['news'] }
        , loadMore: function(){
            return this.thisPageInfo.skip + this.thisPageInfo.limit < this.thisPageInfo.total;
        }
    }

    , methods: {

        ...mapMutations(['setPosts', 'setPageInfo'])
        , async viewMore()
        {

            let loaded = this.thisPageInfo.skip + 20;

            let result = await cttfClient.getEntries({
                content_type: 'news'
                , skip: loaded
                , limit: this.thisPageInfo.limit
                , order: '-fields.publishedDate,-sys.createdAt'
            });

            if (result){
                this.setPosts(result);
                this.setPageInfo(result);
            }
        }

    }

    , async asyncData({ payload, store, params, error }) {

        const result = payload 
            || (store.state.news.length > 0)
                ? store.state.news
                : await cttfClient.getEntries({
                    content_type: 'news'
                    , order: '-fields.publishedDate,-sys.createdAt'
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