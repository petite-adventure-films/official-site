import { HttpError } from '../auth';
import { validateBlogAssets } from '../blog-draft';
import type { Database, Draft } from '../repositories/content-drafts';
import type { BlogDraft } from '../../src/features/blog/draft';
import type { EventDraft } from '../../src/features/events/draft';

export async function validateDraftReferences(db: Database, type: Draft['type'], payload: EventDraft | BlogDraft) {
  if (type === 'blog' && 'body' in payload) {
    await validateBlogAssets(db, payload.body.doc);
    if (payload.categoryId !== null && !await db.prepare('SELECT id FROM blog_categories WHERE id = ?').bind(payload.categoryId).first()) {
      throw new HttpError(422, 'unknown_category');
    }
  }
  for (const [kind, ids] of [['film', payload.filmTagIds], ['event', payload.eventTagIds]] as const) {
    for (const id of ids) {
      if (!await db.prepare('SELECT id FROM tags WHERE kind = ? AND id = ?').bind(kind, id).first()) throw new HttpError(422, 'unknown_tag');
    }
  }
}
