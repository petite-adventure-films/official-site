import { createClient } from '@/plugins/contentful'

const client = createClient();

const postTypes = [
	  'post'
	, 'category'
	, 'series'
	, 'news'
	, 'event'
	, 'media'
	, 'video'
	, 'film'
	, 'shop'
];

const entriesParams = {
	event:
	{
		  order: '-fields.publishedDate,sys.createdAt'
		, 'fields.startDate[gte]' : new Date().getFullYear() + '-01-01'
	}
	, news:  {
		  order: '-sys.createdAt'
		, limit: 20
	}
	, film  : { order: '-sys.createdAt'}
	, shop  : { order: '-sys.createdAt'}
	, post  : { order: '-fields.publishedDate,-fields.order,-sys.createdAt' }
	, media : { order: '-fields.publishedDate,-fields.order,-sys.createdAt' }
	, video : { order: '-fields.order,sys.createdAt' }
	, series : { order: 'fields.order,sys.createdAt' }
}

export const state = () => ({
	  news:  []
	, event: []
	, film:  []
	, shop:  []
	, video: []
	, media: []
	, post:  []
	, series: []
	, category: []
	, pageInfo: {}
	, contentsInfo: {}
})

export const getters = {
}

export const mutations = {

	setPosts: (state, payload) => {
		let type = payload.sys.contentType.sys.id;
		if(state[type] === undefined)
		{
			state[type] = new Array();
		}

		if(!state[type].find((e) => e.sys.id ===  payload.sys.id))
		{
			state[type].push(payload);
		}
	}

	, setPageInfo: (state, payload) => {
		if(payload.items.length > 0)
		{
			let type = payload.items[0].sys.contentType.sys.id;
			if(state.pageInfo[type] === undefined)
			{
				state.pageInfo[type] = {};
			}
			state.pageInfo[type]['total'] = payload.total;
			state.pageInfo[type]['skip'] = payload.skip;
			state.pageInfo[type]['limit'] = payload.limit;

			if(state.contentsInfo[type] === undefined)
			{
				state.contentsInfo[type] = {};
			}
			state.contentsInfo[type] = payload

		}
	}

}

export const actions = {

	async getAllPosts({commit, state}, payload)
	{
		let self = this;
		let resolvedPromisesArray = [];
		postTypes.forEach((v) => {
			let params = entriesParams[v] || {};
			params.content_type = v;
			params.include = 2;
			resolvedPromisesArray.push(client.getEntries(params));
		})
		await Promise.all(resolvedPromisesArray).then((res) => {
			res.forEach((contents) => {
				commit('setPageInfo', contents);
				contents.items.forEach((post) => {
					commit('setPosts', post);
				})
			})
		})
	}

}