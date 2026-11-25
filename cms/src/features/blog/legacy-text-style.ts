import { Mark } from '@tiptap/react';
import { legacyStyleKeys, legacyStyleHtml } from '../../../../packages/content-schema/legacy-text-style';

export const LegacyTextStyle = Mark.create({
  name: 'legacyTextStyle',
  addAttributes() { return Object.fromEntries(legacyStyleKeys.map(key => [key, { default: null }])); },
  // Imported by the checked migration path; arbitrary pasted CSS is not adopted.
  parseHTML() { return []; },
  renderHTML({ mark }) {
    return ['span', legacyStyleHtml(Object.fromEntries(Object.entries(mark.attrs).filter(([, value]) => value !== null))), 0];
  },
});
