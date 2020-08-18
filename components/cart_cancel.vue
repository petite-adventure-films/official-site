<template>
	<v-dialog　persistent
		v-model="dialog"
		max-width="290"
		v-if="data.item"
			><v-card class="pa-4">
				{{data.item.fields.title}}
				{{data.item.fields.prices[data.key]['key']}}を
				削除してもよろしいですか<br>
				<v-btn color="red" @click="cancel">削除する</v-btn>
				<v-btn text @click="close">CLOSE</v-btn>
			</v-card>
	</v-dialog>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default{

	props: ['dialog', 'data']

	, components: {
	}

	, data: function()
	{
		return{
		}
	}

	, computed: {
	}

	, methods: {
		cancel: function()
		{
			this.$emit('excu')
		}
		, close: function()
		{
			this.$emit('close')
		}
	}

	, mounted: function()
	{
	}

	, created()
	{
	}

}
</script>