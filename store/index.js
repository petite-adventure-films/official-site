import { createClient } from '@/plugins/contentful'
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';

const client = createClient();
const options = {
	}

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

	////////////////////////////////////
	// shop
	////////////////////////////////////

	, pafCart: {}
	, pafCartCount: 0
})

export const getters = {
	linkTo: () => (name, obj) => {
		return { name: `${name}-slug`, params: { slug: obj.fields.slug } }
	}

	, dateFormat: () => (date) => {
		let year  = new Date(date).getFullYear();
		let month = new Date(date).getMonth() + 1;
		let day   = new Date(date).getDate();
		return year + '-' + ('00' + month).slice(-2) + '-' + ('00' + day).slice(-2);
	}

	, renderRichText: () => (contents) => {
		return documentToHtmlString(contents, options);
	}

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
		}
	}

	, setCart: (state, payload) => {
		state.pafCart[payload.id] = payload.purchase
	}

	, setCartCount: (state, payload) => {
		// this.$store.commit('myMutation', window.localStorage.getItem("cart")
		let count = 0
		if(payload)
		{
			count = payload
		}

		else
		{
			Object.keys(state.pafCart).forEach((p) => {
				state.pafCart[p].forEach((n) => count = count + n)
			})
		}
		state.pafCartCount = count
	}

	, updateCart: (state, payload) => {
		// console.log('payload', payload)
		state.pafCart[payload.id][payload.key] = payload.value
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