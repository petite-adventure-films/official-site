import { Node } from '@tiptap/react';
import { externalVideoKeys, videoFrameAttributes } from '../../../../packages/content-schema/external-video';

export const ExternalVideoNode = Node.create({
  name: 'externalVideo', group: 'block', atom: true,
  addAttributes() { return Object.fromEntries(externalVideoKeys.map(key => [key, { default: null }])); },
  // HTML import is handled by the preflight converter, not by arbitrary clipboard HTML.
  parseHTML() { return []; },
  renderHTML({ node }) {
    const attrs = Object.fromEntries(Object.entries(node.attrs).filter(([, value]) => value !== null));
    const frame = videoFrameAttributes(attrs, true);
    const width = frame.width ?? 560, height = frame.height ?? 315;
    return [node.type.name === 'inlineExternalVideo' ? 'span' : 'div', { style: `${node.type.name === 'inlineExternalVideo' ? 'display:inline-block;' : ''}width:${width}px;max-width:100%;aspect-ratio:${width}/${height}` }, ['iframe', { ...frame, loading: 'lazy', referrerpolicy: 'strict-origin-when-cross-origin', style: 'width:100%;height:100%' }]];
  },
});

// Preserve an iframe that shares a paragraph with text; never split the paragraph.
export const InlineExternalVideoNode = ExternalVideoNode.extend({ name: 'inlineExternalVideo', group: 'inline', inline: true });
