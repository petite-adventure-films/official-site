<template>
	<div>
		<form ref="form" name="contact" method="POST" data-netlify="true" data-netlify-honeypot="bot-field">
			<input type="hidden" name="form-name" value="contact">
			<input type="hidden" name="bot-field">
			<label>Your Name: <input type="text" name="name" /></label><br>
			<label>Your Email: <input type="email" name="email" /></label><br>
			<label>Message: <textarea name="message"></textarea></label><br>
			<v-btn @click="submit">SEND</v-btn>
		</form>
	</div>
</template>

<script>
export default {

	data: function()
	{
		return {

		}
	}

	methods: {
		submit: function()
		{
			const params = new URLSearchParams();
			params.append('form-name', 'contact');
			params.append('username', 'ress');
			params.append('message', 'msg');

			this.$axios.$post('/', params)
				.then((res) => {
					console.log('done')
				})
		}
	}

}
</script>