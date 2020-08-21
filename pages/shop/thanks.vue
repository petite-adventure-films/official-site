<template>
	<div>
		ありがとうございました。<br>
		注文番号 : {{orderID}}
	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {

	components: {
	}

	, data: function()
	{
		return{
			orderID: this.$route.params.orderID
		}
	}

	, computed: {
	}

}
</script>