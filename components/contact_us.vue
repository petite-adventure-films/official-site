<template>
	<div>
		{{text}}
		<v-btn>お問い合わせ</v-btn>
	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default{

	props: ['message']

	, components: {
	}

	, data: function()
	{
		return{
		}
	}

	, computed: {
		...mapGetters(['linkTo'])
		, text: function(){
			return (this.message) ? this.message : 'お問い合わせはこちら'
		}
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