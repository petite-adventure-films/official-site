import type { BodyNode } from '../../cms/src/features/blog/draft';
import { validLink } from '../../cms/src/features/blog/draft';

export type EventText = string | { schemaVersion: 2; doc: BodyNode };
export const eventTextFields = ['timeDescription', 'access', 'venueNotes', 'fee', 'organizer', 'notes'] as const;

// Run after JSON Schema validation. Bound depth before traversing untrusted editor data.
export function validEventText(value: EventText): boolean {
  if (typeof value === 'string') return true;
  function visit(node: BodyNode, depth = 0): boolean {
    return depth <= 40 &&
      (node.type !== 'link' || validLink(node.attrs!.href as string)) &&
      (node.marks ?? []).filter(m => m.type === 'link').length <= 1 &&
      [...(node.content ?? []), ...(node.marks ?? [])].every(child => visit(child, depth + 1));
  }
  return visit(value.doc);
}

export function eventTextPlain(value: EventText): string {
  if (typeof value === 'string') return value;
  function text(node: BodyNode): string {
    if (node.type === 'text') return node.text ?? '';
    if (node.type === 'hardBreak') return '\n';
    const result = (node.content ?? []).map(text).join('');
    return ['paragraph', 'heading', 'listItem'].includes(node.type) ? result + '\n' : result;
  }
  return text(value.doc).trimEnd();
}
