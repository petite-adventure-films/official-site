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
				<label>Your Role: <select name="role[]" multiple>
					<option value="leader">Leader</option>
					<option value="follower">Follower</option>
				</select></label>
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
import { mapState} from 'vuex'
import cardNews from '@/components/card_news'
import cardFilm from '@/components/card_film'
import cardPost from '@/components/card_post'

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