<template>
    <article>
        <cardFilm
        v-for = "post in film"
        :key  = "'film' + post.sys.id"
            :post="post"></cardFilm>
    </article>
</template>
<script>
import { mapState, mapGetters } from 'vuex'
import cttfClient from '@/plugins/contentful'
import cardFilm from '@/components/card_film'


export default {

    components:{
        cardFilm
    }

    , computed: {
        ...mapState(['film'])
        , ...mapGetters(['linkTo', 'dateFormat'])
    }

    , created: function()
    {
    }

    , async asyncData({ payload, store, params, error }) {

        const result = payload 
            || (store.state.film.length > 0)
                ? store.state.film
                : await cttfClient.getEntries({
                    content_type: 'film'
                    , order: '-sys.createdAt'
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