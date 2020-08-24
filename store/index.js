import cttfClient from '@/plugins/contentful'
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';


const options = {
    renderNode: {
        ["paragraph"]: (node, next) => `<p>${next(node.content).replace(/\n/g, `<br>`)}</p>`
        , [BLOCKS.EMBEDDED_ASSET]: ({ data: { target: { fields }}}) =>
            `<img src="${fields.file.url}?q=80">`
        , [BLOCKS.EMBEDDED_ENTRY]: (node) =>
            `<div class="card-post">
                ${(node.data.target.fields.category) ? node.data.target.fields.category.fields.title : ''}
                ${(node.data.target.fields.relatedSeries && node.data.target.fields.relatedSeries.fields) ? node.data.target.fields.relatedSeries.fields.title : ''}<br>
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

const entriesParams = {
    event:
    {
          order: '-fields.startDate,sys.createdAt'
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

    // 記事
      news:  []
    , event: []
    , film:  []
    , shop:  []
    , video: []
    , media: []
    , post:  []
    , series: []
    , category: [
          { fields: {title: 'お知らせ', slug: 'お知らせ', titleAbbr: 'お知らせ'}, sys: { id: '5FAp3e8RKwjaEIfHP42Td9' } }
        , { fields: {title: '上映会・イベントレポート', slug: '上映会・イベントレポート', titleAbbr: 'レポート'}, sys: { id: '5pSHDdKB1goUInTYm7kI4A' } }
        , { fields: {title: '雑木林コラム', slug: '雑木林コラム', titleAbbr: '雑木林コラム'}, sys: { id: '3k7zbt4vJ2DE8vyzSXkkjY' } }
        , { fields: {title: '制作日誌', slug: '制作日誌', titleAbbr: '制作日誌'}, sys: { id: '52UAIoSd3RdquK1NxW0KIH' } }
        , { fields: {title: '映画監督、日々の暮らし', slug: '映画監督、日々の暮らし', titleAbbr: '日々の暮らし'}, sys: { id: '3JCGW4YJNRAT6lHEUvFEXv' } }
    ]
    , pageInfo: {}

    // shop
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
        if(payload.items.length > 0)
        {
            payload.items.forEach((a) => {
                let type = a.sys.contentType.sys.id;
                if(state[type] === undefined)
                {
                    state[type] = new Array();
                }
        
                if(!state[type].find((e) => e.sys.id ===  a.sys.id))
                {
                    state[type].push(a);
                }
            })
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
        state.pafCart[payload.id][payload.key] = payload.value
    }

    , emptyCart: (state, payload) => {
        state.pafCart = {}
    }

}

export const actions = {
}