import { Mark, Node } from '@tiptap/react';
const safeId = (id: unknown) => typeof id === 'string' && /^asset_[a-f0-9]{32}$/.test(id) ? id : '';
export const AssetImage = Node.create({
  name: 'assetImage', group: 'block', atom: true, draggable: true,
  addAttributes() { return { assetId: { default: null }, alt: { default: '' } }; },
  // Imported HTML must not invent references to CMS assets.
  parseHTML() { return []; },
  renderHTML({ node }) { return ['img', { src: `/api/media/${safeId(node.attrs.assetId)}/file`, alt: node.attrs.alt, 'data-asset-id': safeId(node.attrs.assetId) }]; },
});
export const AssetLink = Mark.create({
  name: 'assetLink', excludes: 'link assetLink', inclusive: false,
  addAttributes() { return { assetId: { default: null }, assetKind: { default: 'document' } }; },
  parseHTML() { return []; },
  renderHTML({ mark }) { return ['a', { href: `/api/media/${safeId(mark.attrs.assetId)}/file`, 'data-asset-id': safeId(mark.attrs.assetId), download: '' }, 0]; },
});
