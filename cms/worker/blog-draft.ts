import Ajv from 'ajv/dist/2020';
import schema from '../../packages/content-schema/schemas/content/blog-draft.schema.json';
import { validLink, type BodyNode } from '../src/features/blog/draft';
const validate = new Ajv({ allErrors: true, strictTuples: false }).compile(schema);
export function validateBlogDraft(value: unknown): value is Record<string, any> {
  // Bound nesting before AJV walks recursive schemas.
  function bounded(v: unknown, depth = 0): boolean {
    if (depth > 80) return false;
    return !v || typeof v !== 'object' || Object.values(v).every(child => bounded(child, depth + 1));
  }
  if (!bounded(value) || !validate(value)) return false;
  function links(n: BodyNode): boolean { return (n.type !== 'link' || validLink(n.attrs!.href as string)) && [...(n.content ?? []), ...(n.marks ?? [])].every(links); }
  return links((value as any).body.doc);
}
