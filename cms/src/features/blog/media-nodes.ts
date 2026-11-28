import { Mark, Node } from '@tiptap/react';
import { imageKeys, assetLinkKeys, imageAttributes, assetLinkAttributes } from '../../../../packages/content-schema/body-media';
const path = (id: unknown) => `/api/media/${typeof id === 'string' && /^asset_[a-f0-9]{32}$/.test(id) ? id : ''}/file`;
export const AssetImage = Node.create({
  name: 'assetImage', group: 'block', atom: true, draggable: true,
  addAttributes() { return Object.fromEntries(imageKeys.map(k => [k, {default: k === 'alt' ? '' : null}])); },
  // Imported HTML must not invent references to CMS assets.
  parseHTML() { return []; },
  renderHTML({ node }) { return ['img', { ...imageAttributes(node.attrs, path), 'data-asset-id': node.attrs.assetId, ...(node.type.name === 'inlineAssetImage' ? {style: 'display:inline'} : {}) }]; },
});
export const InlineAssetImage = AssetImage.extend({name: 'inlineAssetImage', group: 'inline', inline: true});
export const AssetLink = Mark.create({
  name: 'assetLink', excludes: 'link assetLink', inclusive: false,
  addAttributes() { return Object.fromEntries(assetLinkKeys.map(k => [k, {default: k === 'assetKind' ? 'document' : null}])); },
  parseHTML() { return []; },
  renderHTML({ mark }) { return ['a', { ...assetLinkAttributes(mark.attrs, path), 'data-asset-id': mark.attrs.assetId }, 0]; },
});
