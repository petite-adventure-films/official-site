<template>
	<div>

		<div
		v-for = "post in shop"
		:key = "post.sys.id"
			><cardShop :post="post.fields.film"></cardShop>
		</div>

	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import cardShop from '@/components/card_shop'
import cttfClient from '@/plugins/contentful'

export default {

	components: {
		cardShop
	}

	, computed: {
		...mapState(['shop'])
	}

    , async asyncData({ payload, store, params, error }) {

        const result = payload 
            || (store.state.shop.length > 0)
                ? store.state.shop
                : await cttfClient.getEntries({
                    content_type: 'shop'
                    , order: '-sys.createdAt'
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