import { Node } from '@tiptap/react';

// A discretionary break remains invisible until the line needs to wrap.
export const WordBreak = Node.create({
  name: 'wordBreak',
  group: 'inline',
  inline: true,
  selectable: false,
  parseHTML() { return [{ tag: 'wbr' }]; },
  renderHTML() { return ['wbr']; },
  renderText() { return ''; },
});
