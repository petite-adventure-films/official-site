import { HttpError } from '../auth';
import { validateBlogAssets } from '../blog-draft';
import type { Database, Draft } from '../repositories/content-drafts';
import type { BlogDraft } from '../../src/features/blog/draft';
import type { EventDraft } from '../../src/features/events/draft';
import type { ArticleDraft } from '../../src/features/articles/draft';

export async function validateDraftReferences(db: Database, type: Draft['type'], payload: EventDraft | BlogDraft | ArticleDraft) {
  if (type !== 'event' && 'body' in payload) {
    await validateBlogAssets(db, payload.body.doc);
    if (type === 'blog') {
      const categoryId = (payload as BlogDraft).categoryId;
      if (categoryId !== null && !await db.prepare('SELECT id FROM blog_categories WHERE id = ?').bind(categoryId).first()) throw new HttpError(422, 'unknown_category');
    }
    if (type === 'pressCoverage') {
      const press = payload as ArticleDraft;
      await validateBlogAssets(db, press.articleBody!.doc);
      for (const id of press.attachmentAssetIds!) {
        const row = await db.prepare('SELECT asset_json FROM media_uploads WHERE id = ? AND asset_json IS NOT NULL').bind(id).first<{ asset_json: string }>();
        if (!row) throw new HttpError(422, 'invalid_asset');
        const asset = JSON.parse(row.asset_json);
        if (asset.kind !== 'document' || asset.original?.mimeType !== 'application/pdf') throw new HttpError(422, 'invalid_asset');
      }
    }
  }
  const eventIds = 'eventTagIds' in payload ? payload.eventTagIds : [];
  for (const [kind, ids] of [['film', payload.filmTagIds], ['event', eventIds]] as const) {
    for (const id of ids) {
      if (!await db.prepare('SELECT id FROM tags WHERE kind = ? AND id = ?').bind(kind, id).first()) throw new HttpError(422, 'unknown_tag');
    }
  }
}
