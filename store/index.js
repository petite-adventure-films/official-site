import { createClient } from '@/plugins/contentful'
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';

const client = createClient();
const options = {
	renderNode: {
		["paragraph"]: (node, next) => `<p>${next(node.content).replace(/\n/g, `<br>`)}</p>`
		, [BLOCKS.EMBEDDED_ASSET]: ({ data: { target: { fields }}}) =>
			`<img src="${fields.file.url}?q=80">`
		, [BLOCKS.EMBEDDED_ENTRY]: (node) =>
			`<div class="card-post">
				${(node.data.target.fields.category) ? node.data.target.fields.category.fields.title : ''}
				${(node.data.target.fields.relatedSeries) ? node.data.target.fields.relatedSeries.fields.title : ''}<br>
				<a href="${process.env.BASE_URL}/blog/${node.data.target.fields.slug}">${node.data.target.fields.title}</a>
			</div>`
		, [INLINES.EMBEDDED_ENTRY]: (node) =>
			`<a href="${process.env.BASE_URL}/blog/${node.data.target.fields.slug}">${node.data.target.fields.title}</a>`
		, [INLINES.HYPERLINK]: (node) => {
			if((node.data.uri).includes('youtube.com/embed')){
				return `<iframe src=${node.data.uri} allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" frameBorder="0" allowFullScreen></iframe></IframeContainer>`
			}
			else if (!(node.data.uri).startsWith(process.env.SITE_URL))
			{
					return (node.content[0].value) ? `<a href="${node.data.uri}" target="_blank">${node.content[0].value}</a>` : ''
			}
			else
			{
				return (node.content[0].value) ? `<a href="${node.data.uri}">${node.content[0].value}</a>` : ''
			}
		}
	}
};

// return `<a href="${node.data.uri}"${
//          node.data.uri.startsWith('https://yourdomain.com')
//            ? ''
//            : ' target="_blank"'
//        }>${next(node.content)}</a>`

const postTypes = [
	  'post'
	, 'category'
	, 'series'
	, 'news'
	, 'event'
	, 'media'
	, 'video'
	, 'film'
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
	, post  : { order: '-fields.publishedDate,-fields.order,-sys.createdAt' }
	, media : { order: '-fields.publishedDate,-fields.order,-sys.createdAt' }
	, video : { order: '-fields.order,sys.createdAt' }
	, series : { order: 'fields.order,sys.createdAt' }
}

export const state = () => ({
	  news:  []
	, event: []
	, film:  []
	, video: []
	, media: []
	, post:  []
	, series: []
	, category: []
	, pageInfo: {}
	, contentsInfo: {}
})

export const getters = {

	linkTo: () => (name, obj) => {
		if(obj)
		{
			return { name: `${name}-slug`, params: { slug: obj.fields.slug } }
		}

		else
		{
			return { name: name }
		}
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
		postTypes.forEach((e) => {
			let params = entriesParams[e] || {};
			params.content_type = e;
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