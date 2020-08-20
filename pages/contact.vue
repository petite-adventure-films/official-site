<template>
	<div>
		<form name="contact" method="POST" data-netlify="true" data-netlify-honeypot="bot-field" action="/thankyou">
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

	methods: {
		submit: function()
		{
			const params = new URLSearchParams();
			params.append('form-name', 'contact');
			params.append('name', 'restard');
			params.append('useremail', 'drestard@gmail.com');
			params.append('message', 'testtesttest');
			console.log('params', params)
			this.$axios.$post('/thankyou', params)
				.then((res) => {
					console.log('done')
				})
		}
	}

}
</script>