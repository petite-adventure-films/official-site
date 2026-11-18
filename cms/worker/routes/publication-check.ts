import { localBlogSlugPrefix, prepareBlogPublication } from '../blog-publication';
import { HttpError } from '../auth';
import { ContentDraftRepository, type Database } from '../repositories/content-drafts';
import { PublicationUrls, PublicationUrlConflict } from '../services/publication-urls';
import { prepareEventPublication } from '../event-publication';
import { readJson } from './json';
import { tags } from './tags';
export async function publicationCheck(request: Request, db: Database, id: string, supportsLocalBlog = false) {
  if (request.method !== 'POST') throw new HttpError(404, 'not_found');
  const body = await readJson(request);
  if (!body || typeof body !== 'object' || Object.keys(body).some(key => key !== 'expectedVersion') ||
    !Number.isSafeInteger(body.expectedVersion) || body.expectedVersion < 1) throw new HttpError(422, 'invalid_payload');
  const repository = new ContentDraftRepository(db);
  const saved = await repository.get(id);
  if (!saved) throw new HttpError(404, 'not_found');
  if (saved.version !== body.expectedVersion) throw new HttpError(409, 'conflict');
  if (saved.type === 'blog') {
    if (!supportsLocalBlog) throw new HttpError(422, 'blog_operation_unavailable');
    try {
      const candidate = await prepareBlogPublication(db, saved.payload);
      await new PublicationUrls(db).plan(id, localBlogSlugPrefix + candidate.content.slug);
    } catch (error) {
      if (!(error instanceof HttpError) && !(error instanceof PublicationUrlConflict) &&
        !(error instanceof Error && error.message === 'invalid_blog_publication')) throw error;
      return Response.json({ ok: false, version: saved.version, issues: [{
        field: '_schema', code: 'invalid_shape', message: 'ブログの公開内容とURLを確認してください。',
      }] });
    }
    if ((await repository.get(id))?.version !== saved.version) throw new HttpError(409, 'conflict');
    return Response.json({ ok: true, version: saved.version });
  }
  const available = await tags(db);
  const result = prepareEventPublication(saved.payload, { contentId: id,
    filmTagIds: new Set(available.filmTags.map(tag => tag.id)), eventTagIds: new Set(available.eventTags.map(tag => tag.id)) });
  const issues = result.ok ? [] : [...result.issues];
  if (!issues.some(issue => issue.field === '_schema' || issue.field === 'slug')) {
    try {
      await new PublicationUrls(db).plan(id, (saved.payload.slug as string | undefined) ?? id);
    } catch (error) {
      if (!(error instanceof PublicationUrlConflict)) throw error;
      issues.push({ field: 'slug', code: 'url_reserved', message: 'このURLは使用されています。別のslugを入力してください。' });
    }
  }
  if ((await repository.get(id))?.version !== saved.version) throw new HttpError(409, 'conflict');
  // Read-only check: never return a deployable payload or write publication state.
  return Response.json(!issues.length ? { ok: true, version: saved.version } : { ok: false, version: saved.version, issues });
}
