import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { BLOCKS, INLINES } from '@contentful/rich-text-types';

const renderRichText = (obj) => {
	const options = {
		renderNode: {
			  [BLOCKS.EMBEDDED_ASSET]: ({ data: { target: { fields }}}) =>
				`<img src="${fields.file.url}?h=320&q=50">`
			, [INLINES.EMBEDDED_ENTRY]: (node) =>
				`<a href="${process.env.BASE_URL}/kawaraban/${node.data.target.fields.slug}">${node.data.target.fields.title}</a>`
		}
	};

	return documentToHtmlString(obj, options)
}

export default ({app}, inject) => {
	inject('renderRichText', renderRichText)
}