<template>
	<div>
		お問い合わせはこちら
		<v-btn>お問い合わせ</v-btn>
	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default{

	props: []

	, components: {
	}

	, data: function()
	{
		return{
		}
	}

	, computed: {
		...mapGetters(['linkTo'])
	}

	, methods: {
	}

	, mounted: function()
	{
	}

	, created()
	{
	}

}
</script>