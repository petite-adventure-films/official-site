<template>
	<div>
		<form name="contact" method="POST" netlify>
			<input type="hidden" name="form-name" value="contact">
			<p>
				<label>Your Name: <input type="text" name="name" /></label>
			</p>
			<p>
				<label>Your Email: <input type="email" name="email" /></label>
			</p>
			<p>
				<label>Message: <textarea name="message"></textarea></label>
			</p>
			<p>
				<button type="submit">Send</button>
			</p>
		</form>
	</div>
</template>

<script>

export default {

	components: {
		cardNews, cardFilm, cardPost
	}

	, computed: {
		...mapState(['news', 'film', 'post'])
		, sortedNews: function(){
			return this.news.slice(0, 3)
		}
	}
}
</script>