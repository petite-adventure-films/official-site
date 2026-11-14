import { HttpError, type Actor } from '../auth';
import { ContentDraftRepository, DraftConflict, DraftNotFound, type Database } from '../repositories/content-drafts';
import { validateDraft } from '../event-draft';

export async function contents(request: Request, db: Database, actor: Actor) {
  const url = new URL(request.url);
  const repository = new ContentDraftRepository(db);
  if (url.pathname === '/api/contents' && request.method === 'GET') {
    if (url.searchParams.get('type') !== 'event') throw new HttpError(422, 'unsupported_type');
    const page = Number(url.searchParams.get('page') ?? 1);
    const keyword = url.searchParams.get('q') ?? '';
    if (!Number.isSafeInteger(page) || page < 1 || page > 1_000_000 || keyword.length > 200) throw new HttpError(422, 'invalid_query');
    return Response.json(await repository.list(page, keyword));
  }
  const match = url.pathname.match(/^\/api\/contents\/([0-9a-f-]{36})$/i);
  if (match && request.method === 'GET') {
    const draft = await repository.get(match[1]);
    if (!draft) throw new HttpError(404, 'not_found');
    return Response.json(draft);
  }
  const create = url.pathname === '/api/contents' && request.method === 'POST';
  if (!create && !(match && request.method === 'PUT')) throw new HttpError(404, 'not_found');
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(422, 'invalid_json');
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > 256 * 1024) { await reader.cancel(); throw new HttpError(413, 'payload_too_large'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  let body;
  try { body = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
  catch { throw new HttpError(422, 'invalid_json'); }
  const allowed = create ? ['operationId', 'type', 'payload'] : ['operationId', 'expectedVersion', 'payload'];
  if (!body || typeof body !== 'object' || Object.keys(body).some((key) => !allowed.includes(key)) ||
    typeof body.operationId !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.operationId) ||
    (create && body.type !== 'event') || (!create && (!Number.isSafeInteger(body.expectedVersion) || body.expectedVersion < 1)) ||
    !validateDraft(body.payload)) throw new HttpError(422, 'invalid_payload');
  for (const [kind, ids] of [['film', body.payload.filmTagIds], ['event', body.payload.eventTagIds]] as const) {
    for (const id of ids) {
      if (!await db.prepare('SELECT id FROM tags WHERE kind = ? AND id = ?').bind(kind, id).first()) throw new HttpError(422, 'unknown_tag');
    }
  }
  try {
    const draft = await repository.save({ actor: actor.id, operationId: body.operationId, payload: body.payload,
      ...(create ? {} : { target: { id: match![1], expectedVersion: body.expectedVersion } }),
    });
    return Response.json(draft, { status: create ? 201 : 200 });
  } catch (error) {
    if (error instanceof DraftConflict) throw new HttpError(409, 'conflict');
    if (error instanceof DraftNotFound) throw new HttpError(404, 'not_found');
    throw error;
  }
}
