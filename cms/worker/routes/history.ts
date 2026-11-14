import { HttpError, type Actor } from '../auth';
import { ContentDraftRepository, DraftConflict, DraftNotFound, type Database } from '../repositories/content-drafts';
import { RestoreService, RestoreInvalid, restorePayload } from '../services/restore';
import { readJson } from './json';
export async function history(request: Request, db: Database, actor: Actor, id: string, action: string) {
  const service = new RestoreService(db);
  try {
    if (action === 'history' && request.method === 'GET') {
      const draft = await new ContentDraftRepository(db).get(id);
      if (!draft) throw new DraftNotFound();
      const items = (await service.history(id)).map(item => ({
        id: item.id, kind: item.kind, at: item.at,
        actorName: item.actorName ?? (item.actor === actor.id ? actor.name : '表示名未登録'),
        payload: restorePayload(item),
      }));
      return Response.json({ version: draft.version, items });
    }
    if (action !== 'restore' || request.method !== 'POST') throw new HttpError(404, 'not_found');
    const body = await readJson(request);
    if (!body || typeof body !== 'object' || Object.keys(body).some(k => !['operationId', 'expectedVersion', 'sourceKind', 'sourceId'].includes(k)) ||
      typeof body.operationId !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.operationId) ||
      typeof body.sourceId !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.sourceId) ||
      !['publication', 'protectedDraft'].includes(body.sourceKind) || !Number.isSafeInteger(body.expectedVersion) || body.expectedVersion < 1) throw new HttpError(422, 'invalid_payload');
    return Response.json(await service.restore({ ...body, contentId: id, actor: actor.id, actorName: actor.name }));
  } catch (error) {
    if (error instanceof DraftConflict) throw new HttpError(409, 'conflict');
    if (error instanceof DraftNotFound) throw new HttpError(404, 'not_found');
    if (error instanceof RestoreInvalid) throw new HttpError(422, 'unsupported_snapshot');
    throw error;
  }
}
