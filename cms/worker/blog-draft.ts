import Ajv from 'ajv/dist/2020';
import schema from '../../packages/content-schema/schemas/content/blog-draft.schema.json';
import { validLink, type BodyNode } from '../src/features/blog/draft';
import type { Database } from './repositories/content-drafts';
import { validExternalVideo } from '../../packages/content-schema/external-video';
import { validBodyAnchors } from '../../packages/content-schema/legacy-containers';
import { HttpError } from './auth';
const validate = new Ajv({ allErrors: true, strictTuples: false }).compile(schema);
export function validateBlogDraft(value: unknown): value is Record<string, any> {
  // Bound nesting before AJV walks recursive schemas.
  function bounded(v: unknown, depth = 0): boolean {
    if (depth > 80) return false;
    return !v || typeof v !== 'object' || Object.values(v).every(child => bounded(child, depth + 1));
  }
  if (!bounded(value) || !validate(value)) return false;
  function links(n: BodyNode): boolean { return (!['externalVideo', 'inlineExternalVideo'].includes(n.type) || validExternalVideo(n.attrs)) && (n.type !== 'link' || validLink(n.attrs!.href as string)) && !((n.marks ?? []).filter(m => ['link', 'assetLink'].includes(m.type)).length > 1) && [...(n.content ?? []), ...(n.marks ?? [])].every(links); }
  return links((value as any).body.doc) && validBodyAnchors((value as any).body.doc);
}
export async function validateBlogAssets(db: Database, doc: BodyNode) {
  const references = new Map<string, string>();
  function visit(n: BodyNode) {
    if (n.type === 'assetImage' || n.type === 'assetLink') {
      const id = n.attrs!.assetId as string, kind = n.type === 'assetImage' ? 'image' : 'document';
      if (references.has(id) && references.get(id) !== kind) throw new HttpError(422, 'asset_kind_mismatch');
      references.set(id, kind);
    }
    [...(n.content ?? []), ...(n.marks ?? [])].forEach(visit);
  }
  visit(doc);
  for (const [id, kind] of references) {
    const row = await db.prepare('SELECT asset_json FROM media_uploads WHERE id = ? AND asset_json IS NOT NULL').bind(id).first<{ asset_json: string }>();
    if (!row || JSON.parse(row.asset_json).kind !== kind) throw new HttpError(422, 'invalid_asset');
  }
}
