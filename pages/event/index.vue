<template>
	<div>
		<h1>上映会・イベント</h1>

		<br><br>
		<v-btn outlined @click="genDisplayedPosts()">Latest</v-btn>

		<br>
		<div v-for="(arr, key) in dateIndexs">
			<div v-if="key >= thisYear">
				<span>{{key}}</span>
				<v-btn
				v-for="val in arr"
					outlined
					@click="genDisplayedPosts(key, val)"
					>{{convertMonth(val)}}
				</v-btn>
			</div>
		</div>

		<br><br>
		<div
		v-for="post in sortedPosts"
			><cardEvent :post="post.data"></cardEvent>
		</div>

		<br><br>
		Archives
		<v-btn
		v-for="(val, key) in archiveIndexs"
			outlined
			:to = "{name:'event-archive', params:{archive:val}}"
			>{{val}}
		</v-btn>

		<br><br>
		<nuxt-link :to="{name:'index'}">←HOME</nuxt-link>
	</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { createClient } from '@/plugins/contentful'
import cardEvent from '@/components/card_event'

const client = createClient();

export default{

	components:{
		cardEvent
	}

	, data: function()
	{
		return{
			  thisYear : new Date().getFullYear()
			, rawPosts      : []
			, sortedPosts   : []
			, sortedPostsbyYear: {}
			, dateIndexs: {}
		}
	}

	, computed: {
		  ...mapState()
		, ...mapGetters(['linkTo', 'dateFormat'])

		, archiveIndexs: function()
		{
			let indexs = [];
			for(let i=(this.thisYear - 1); i > 2010; i--)
			{
				indexs.push(i);
			}
			return indexs;
		}
	}

	, methods: {

		convertMonth: function(val)
		{
			return val.toString().slice(-2);
		}

		, genDisplayedPosts: function(year, month)
		{

			let self = this;
			let _pushed = [];
			this.sortedPosts = [];

			function checkHasData(y)
			{
				if(self.sortedPostsbyYear[y] !== undefined)
				{
					return self.sortedPostsbyYear[y];
				}
				else
				{
					throw 'error';
				}
			}

			try
			{

				if(year !==undefined && month !== undefined)
				{
					let data = checkHasData(year);
					this.sortedPostsbyYear[year].forEach((a) => {
						if(a.months.some(m => m === month)
						&& !_pushed.some(v => v === a.key))
						{
							this.sortedPosts.push(a);
							_pushed.push(a.key);
						}
					})
				}

				else if(year !==undefined && month === undefined)
				{
					let data = checkHasData(year);
					this.sortedPosts = this.sortedPostsbyYear[year];
				}

				else
				{

					for(let i=this.thisYear; i < this.thisYear + 10; i++)
					{
						let data = checkHasData(i);
						this.sortedPostsbyYear[i].forEach((a) => {
							if(Math.max(...a.months) >= this.genDateData(new Date())
							&& !_pushed.some(v => v === a.key))
							{
								this.sortedPosts.push(a);
								_pushed.push(a.key);
							}
						})
					}

				}

			}
			catch(err)
			{
			}

		}

		, genDateData: function(data, type)
		{
			let year  = new Date(data).getFullYear().toString();
			let month = (new Date(data).getMonth() + 1).toString();
			return (type == 'year')
				? parseInt(year)
				: parseInt(year + ('00' + month).slice( -2 ));
		}

		, getYears: function(data)
		{

			let years = [];
			let startDateYear = this.genDateData(data.fields.startDate, 'year');

			if(data.fields.endDate)
			{
				let endDateYear = this.genDateData(data.fields.endDate, 'year');
				for(let i=startDateYear; i<=endDateYear; i++)
				{
					years.push(i);
				}
			}

			else
			{
				years.push(startDateYear);
			}

			return years;

		}

		, getMonths: function(data)
		{

			let months = [];
			let startDateMonth = this.genDateData(data.fields.startDate, 'month');

			if(data.fields.endDate)
			{
				let endDateMonth = this.genDateData(data.fields.endDate, 'month');
				for(let i=startDateMonth; i<=endDateMonth; i++)
				{
					let val = parseInt(i.toString().slice(-2));
					if(val > 0 && val < 13){
						months.push(i);
					}
				}
			}

			else
			{
				let year = parseInt(startDateMonth.toString().slice(0, 4));
				if(months === undefined)
				{
					months = [];
				}
				months.push(startDateMonth);
			}

			return months;

		}


		, sort: function(data)
		{
			let arr = Object.keys(data).map((e) => {
				let months = this.getMonths(data[e]);
				let years = this.getYears(data[e]);
				return {
					  key: e
					, startDate : data[e].fields.startDate
					, endDate   : data[e].fields.endDate || false
					, years     : years
					, months    : months
					, data      : data[e]
				}
			});
			return arr.sort((a, b) => a.sorted < b.sorted ? 1 : -1);
		}

	}

	, created: function()
	{

		this.rawPosts = this.sort(this.fetchedPosts);

		this.rawPosts.forEach((a) => {

			a.years.forEach((y) => {
				if(this.sortedPostsbyYear[y] === undefined)
				{
					this.sortedPostsbyYear[y] = [];
				}
				this.sortedPostsbyYear[y].push(a);

				if(this.dateIndexs[y] === undefined)
				{
					this.dateIndexs[y] = [];
				}
				a.months.forEach((m) => {
					if(m.toString().slice(0, 4) == y
					&& !this.dateIndexs[y].some(v => v === m))
					{
						this.dateIndexs[y].push(m);
					}
				});
				this.dateIndexs[y].sort();
			})

		});

		this.genDisplayedPosts();
	}

	// 記事取得
	, async asyncData({ payload, store, params, error }){

		const result = payload
			|| store.state.event.length ? store.state.event : false
			|| await client.getEntries({
				content_type: 'event'
			});

		if (result) {

			let fetchedPosts;

			if(result.items)
			{
				let skipped = 100;
				fetchedPosts = result.items;
				fetchedPosts.forEach(a => store.commit('setPosts', a));
				return { fetchedPosts, skipped }
			}

			else
			{
				fetchedPosts = result;
				return { fetchedPosts }
			}


		} else {
			return error({ statusCode: 400 })
		}
	}
}
</script>