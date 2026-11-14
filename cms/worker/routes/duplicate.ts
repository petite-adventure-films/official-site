import { HttpError, type Actor } from '../auth';
import { ContentDraftRepository, DraftConflict, DraftNotFound, type Database } from '../repositories/content-drafts';
import { readJson } from './json';
export async function duplicate(request: Request, db: Database, actor: Actor, sourceId: string) {
  if (request.method !== 'POST') throw new HttpError(404, 'not_found');
  const body = await readJson(request);
  if (!body || typeof body !== 'object' || Object.keys(body).some((key) => !['operationId', 'expectedVersion'].includes(key)) ||
    typeof body.operationId !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.operationId) ||
    !Number.isSafeInteger(body.expectedVersion) || body.expectedVersion < 1) throw new HttpError(422, 'invalid_payload');
  try {
    return Response.json(await new ContentDraftRepository(db).duplicate({ actor: actor.id, sourceId,
      operationId: body.operationId, expectedVersion: body.expectedVersion }), { status: 201 });
  } catch (error) {
    if (error instanceof DraftConflict) throw new HttpError(409, 'conflict');
    if (error instanceof DraftNotFound) throw new HttpError(404, 'not_found');
    throw error;
  }
}
