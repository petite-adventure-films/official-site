import { blogPath, localBlogSlugPrefix } from '../blog-publication';
import { HttpError, type Actor } from '../auth';
import { ContentDraftRepository, DraftConflict, DraftNotFound, type Database } from '../repositories/content-drafts';
import { PublicationService, PublicationConflict, PublicationInvalid, type PublicationDelivery } from '../services/publication';
import { PublicationUrlConflict, eventPath } from '../services/publication-urls';
import { readJson } from './json';
export async function publication(request: Request, db: Database, actor: Actor, id: string, adapter?: PublicationDelivery) {
  const service = new PublicationService(db);
  try {
    if (!await new ContentDraftRepository(db).get(id)) throw new DraftNotFound();
    if (request.method === 'GET') {
      const latest = await db.prepare('SELECT id FROM publication_operations WHERE content_id = ? ORDER BY created_at DESC, rowid DESC LIMIT 1').bind(id).first<{ id: string }>();
      let op = latest ? await service.get(latest.id) : null;
      if (op && adapter) op = op.state === 'ready' ? await service.deliver(op.id, adapter) : await service.reconcile(op.id, adapter);
      const current = await service.current(id);
      const url = await db.prepare('SELECT slug FROM event_canonical_urls WHERE content_id = ?').bind(id).first<{ slug: string }>();
      return Response.json({ enabled: Boolean(adapter), version: current?.version ?? 0, published: Boolean(current),
        url: url && adapter ? `${adapter.localSiteOrigin ?? 'http://127.0.0.1:4327'}${(url.slug.startsWith(localBlogSlugPrefix) ? blogPath(url.slug.slice(localBlogSlugPrefix.length)) : eventPath(url.slug))}` : null,
        operation: op ? { id: op.id, state: op.state } : null });
    }
    if (request.method !== 'POST') throw new HttpError(405, 'method_not_allowed');
    if (!adapter) throw new HttpError(503, 'publication_unavailable');
    const body = await readJson(request);
    if (!body || typeof body !== 'object' || Object.keys(body).some(k => !['operationId', 'expectedVersion', 'expectedPublicationVersion'].includes(k)) ||
      typeof body.operationId !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.operationId) ||
      !Number.isSafeInteger(body.expectedVersion) || body.expectedVersion < 1 ||
      !Number.isSafeInteger(body.expectedPublicationVersion) || body.expectedPublicationVersion < 0) throw new HttpError(422, 'invalid_payload');
    let op = await service.prepare({ ...body, contentId: id, actor: actor.id, actorName: actor.name }, adapter.supportsLocalBlog);
    if (op.state === 'failed') op = await service.retry(op.id);
    op = op.state === 'ready' ? await service.deliver(op.id, adapter) : await service.reconcile(op.id, adapter);
    return Response.json({ id: op.id, state: op.state }, { status: 202 });
  } catch (error) {
    if (error instanceof PublicationInvalid) return Response.json({ error: 'invalid_publication', issues: error.issues }, { status: 422 });
    if (error instanceof PublicationUrlConflict) return Response.json({ error: 'invalid_publication', issues: [{ field: 'slug', message: 'このURLは使用されています。別のslugを入力してください。' }] }, { status: 422 });
    if (error instanceof DraftNotFound) throw new HttpError(404, 'not_found');
    if (error instanceof DraftConflict || error instanceof PublicationConflict || /publication_single_active|UNIQUE constraint failed|draft_version_conflict|publication_version_conflict/.test(String(error))) throw new HttpError(409, 'publication_conflict');
    throw error;
  }
}
