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

export default {

	components: {
		cardShop
	}

	, computed: {
		...mapState(['shop'])
	}

}
</script>