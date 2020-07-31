<template>
	<div>
		<h1>Events</h1>
		<br><br>
		<v-btn outlined @click="show()">Latest</v-btn>
		<div v-for="">
		</div>

		<v-btn outlined @click="show(2020,9)">2020/9</v-btn>
		<v-btn outlined @click="show(2019)">2019</v-btn>
		<br><br>
		<div
		v-for="post in sortedPosts || posts"
		><v-chip>{{post.data.fields.eventType.fields.name}}</v-chip><br>
			<nuxt-link :to="linkTo('event', post.data)">
				{{post.data.fields.place}}<br>
				{{dateFormat(post.data.fields.startDate)}}
				<span v-if="post.data.fields.endDate"> ~ {{dateFormat(post.data.fields.endDate)}}</span>
			</nuxt-link>
		</div>
		<br><br>
		<nuxt-link :to="{name:'index'}">←HOME</nuxt-link>
	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {

	data: function()
	{
		return{
			  rawPosts      : []
			, sortedPosts   : []
			, thisYearIndex : []
			, archiveIndex  : []
		}
	}

	, computed: {
		  ...mapState(['event'])
		, ...mapGetters(['linkTo', 'dateFormat'])

		// , posts(){

		// 	// return [arr.find(a => new Date(a.startDate) > new Date())];
		// }

	}

	, methods: {

		show: function(year, month)
		{
			console.log('year', year);
			console.log('month', month);
			if(month !== undefined)
			{
				this.sortedPosts = [this.rawPosts.find(a => a.year == year && a.month == month)];
			}
			else if(year !== undefined)
			{
				this.sortedPosts = [this.rawPosts.find(a => a.year == year)];
			}
			else
			{
				this.sortedPosts = [this.rawPosts.find(a => new Date(a.startDate) > new Date())];
			}

		}

	}

	, created: function()
	{
		let storePosts = this.$store.state.event;

		let arr = Object.keys(storePosts).map((e) => ({
				  key: e
				, startDate : storePosts[e].fields.startDate
				, endDate   : storePosts[e].fields.endDate
				, year      : new Date(storePosts[e].fields.startDate).getFullYear()
				, month     : new Date(storePosts[e].fields.startDate).getMonth() + 1
				, data      : storePosts[e]
			}));
		this.rawPosts    = arr.sort((a, b) => a.startDate < b.startDate ? 1 : -1);
		this.sortedPosts = [arr.find(a => new Date(a.startDate) > new Date())];

		let _index = [];
		Object.keys(this.rawPosts).forEach((e) => {
			let year  = new Date(storePosts[e].fields.startDate).getFullYear();
			let month = new Date(storePosts[e].fields.startDate).getMonth() + 1;
			if(_index[year] === undefined)
			{
				_index[year] = {};
				_index[year]['key'] = year;
				_index[year]['months'] = [];
			}
			_index[year]['months'].push(month);
		});
		_index = _index.filter(e => e);

		// con
		this.thisYearIndex = _index.find(e => e.key == new Date().getFullYear()).months;
		this.archiveIndex  = _index.find(e => e.key != new Date().getFullYear());
		// console.log('ind', _ar);

		//  = _index
		// 						.filter(v => v)
		// 						.sort((a, b) => a.key < b.key ? 1 : -1);
		// this.archiveYears =


		// let _index = [];
		// let arr2 = Object.keys(storePosts).map((e) =>
		// 	new Date(storePosts[e].fields.startDate).getFullYear()
		// );
		// arr2.sort((a, b) => a < b ? 1 : -1);

		// Object.keys(this.rawPosts).forEach((e) => {
		// 	let year  = new Date(storePosts[e].fields.startDate).getFullYear();
		// 	let month = new Date(storePosts[e].fields.startDate).getMonth() + 1;
		// 	// console.log('arr2[year]', typeof arr2[year])
		// 	// if(arr2[year] === undefined)
		// 	// {
		// 	// 	arr2[year] = [];
		// 	// }
		// // 	// arr.indexOf("a") >= 0
		// 	// if(arr2[year].indexOf(month) == -1)
		// 	// {
		// 	// 	arr2[year].push(month);
		// 	// }
		// });

		// this.thisYearIndexs = arr2;
	}

	, mounted: function(){
	}
}
</script>