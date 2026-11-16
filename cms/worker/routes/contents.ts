import { HttpError, type Actor } from '../auth';
import { ContentDraftRepository, DraftConflict, DraftNotFound, type Database } from '../repositories/content-drafts';
import { readJson } from './json';
import { validateDraft } from '../event-draft';
import { validateBlogDraft, validateBlogAssets } from '../blog-draft';

export async function contents(request: Request, db: Database, actor: Actor) {
  const url = new URL(request.url);
  const repository = new ContentDraftRepository(db);
  if (url.pathname === '/api/contents' && request.method === 'GET') {
    const type = url.searchParams.get('type');
    if (type !== 'event' && type !== 'blog') throw new HttpError(422, 'unsupported_type');
    const page = Number(url.searchParams.get('page') ?? 1);
    const keyword = url.searchParams.get('q') ?? '';
    if (!Number.isSafeInteger(page) || page < 1 || page > 1_000_000 || keyword.length > 200) throw new HttpError(422, 'invalid_query');
    const result = await repository.list(page, keyword, type);
    const items = await Promise.all(result.items.map(async item => item ? { ...item, published: Boolean(await db.prepare('SELECT content_id FROM publication_state WHERE content_id = ?').bind(item.id).first()) } : item));
    return Response.json({ ...result, items });
  }
  const match = url.pathname.match(/^\/api\/contents\/([0-9a-f-]{36})$/i);
  if (match && request.method === 'GET') {
    const draft = await repository.get(match[1]);
    if (!draft) throw new HttpError(404, 'not_found');
    return Response.json(draft);
  }
  const create = url.pathname === '/api/contents' && request.method === 'POST';
  if (!create && !(match && request.method === 'PUT')) throw new HttpError(404, 'not_found');
  const body = await readJson(request);
  const allowed = create ? ['operationId', 'type', 'payload'] : ['operationId', 'expectedVersion', 'payload'];
  if (!body || typeof body !== 'object' || Object.keys(body).some((key) => !allowed.includes(key)) ||
    typeof body.operationId !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.operationId) ||
    (create && !['event', 'blog'].includes(body.type)) || (!create && (!Number.isSafeInteger(body.expectedVersion) || body.expectedVersion < 1))) throw new HttpError(422, 'invalid_payload');
  const existing = create ? null : await repository.get(match![1]);
  if (!create && !existing) throw new HttpError(404, 'not_found');
  const type = create ? body.type : existing!.type;
  if (!(type === 'blog' ? validateBlogDraft(body.payload) : validateDraft(body.payload))) throw new HttpError(422, 'invalid_payload');
  if (type === 'blog') await validateBlogAssets(db, body.payload.body.doc);
  if (type === 'blog' && body.payload.categoryId !== null && !await db.prepare('SELECT id FROM blog_categories WHERE id = ?').bind(body.payload.categoryId).first()) throw new HttpError(422, 'unknown_category');
  for (const [kind, ids] of [['film', body.payload.filmTagIds], ['event', body.payload.eventTagIds]] as const) {
    for (const id of ids) {
      if (!await db.prepare('SELECT id FROM tags WHERE kind = ? AND id = ?').bind(kind, id).first()) throw new HttpError(422, 'unknown_tag');
    }
  }
  try {
    const draft = await repository.save({ actor: actor.id, operationId: body.operationId, payload: body.payload, type,
      ...(create ? {} : { target: { id: match![1], expectedVersion: body.expectedVersion } }),
    });
    return Response.json(draft, { status: create ? 201 : 200 });
  } catch (error) {
    if (error instanceof DraftConflict) throw new HttpError(409, 'conflict');
    if (error instanceof DraftNotFound) throw new HttpError(404, 'not_found');
    throw error;
  }
}
