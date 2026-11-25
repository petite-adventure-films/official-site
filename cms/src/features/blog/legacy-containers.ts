import { Extension, Node } from '@tiptap/react';
import { semanticKeys, semanticHtml, containerHtml } from '../../../../packages/content-schema/legacy-containers';
import { legacyStyleKeys } from '../../../../packages/content-schema/legacy-text-style';
const compact = (attrs: Record<string, unknown>) => Object.fromEntries(Object.entries(attrs).filter(([, value]) => value !== null));
export const LegacySemantics = Extension.create({
  name: 'legacySemantics',
  addGlobalAttributes() { return [{ types: ['paragraph', 'heading'], attributes: Object.fromEntries(semanticKeys.map(key => [key, {
    default: null, parseHTML: () => null,
    renderHTML: (attrs: Record<string, unknown>) => attrs[key] === null ? {} : semanticHtml({ [key]: attrs[key] }),
  }])) }]; },
});
export const LegacyContainers = [
  ['preservedInline', 'span', 'inline*', true],
  ['preservedTextBlock', 'div', 'inline*', false],
  ['preservedBlock', 'div', 'block*', false],
].map(([name, tag, content, inline]) => Node.create({
  name: name as string, group: inline ? 'inline' : 'block', inline: Boolean(inline), content: content as string,
  addAttributes() { return Object.fromEntries([...semanticKeys, ...legacyStyleKeys].map(key => [key, { default: null }])); },
  parseHTML() { return []; },
  renderHTML({ node }) { return [tag as string, containerHtml(compact(node.attrs)), 0]; },
}));
