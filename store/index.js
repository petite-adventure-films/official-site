import { createClient } from '@/plugins/contentful'
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';

const client = createClient();

export const state = () => ({
	  news:  []
	, event: []
	, film:  []
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
		return documentToHtmlString(contents);
	}
}

export const mutations = {
	setPosts: (state, payload) => {
		let type = payload.sys.contentType.sys.id;
		if(state[type] === undefined)
		{
			state[type] = new Array();
		}
		state[type].push(payload);
	}
}

export const actions = {
	// async getAllPosts({commit}, payload)
	// {
	// 	console.log('paylod')
	// 	await client.getEntries()
	// 		.then(res => {
	// 			res.items.forEach((post) => {
	// 				commit('setPosts', post);
	// 			})
	// 		})
	// 		.catch(console.error)
	// }
}