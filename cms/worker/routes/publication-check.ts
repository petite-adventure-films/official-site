import { HttpError } from '../auth';
import { ContentDraftRepository, type Database } from '../repositories/content-drafts';
import { prepareEventPublication } from '../event-publication';
import { readJson } from './json';
import { tags } from './tags';
export async function publicationCheck(request: Request, db: Database, id: string) {
  if (request.method !== 'POST') throw new HttpError(404, 'not_found');
  const body = await readJson(request);
  if (!body || typeof body !== 'object' || Object.keys(body).some(key => key !== 'expectedVersion') ||
    !Number.isSafeInteger(body.expectedVersion) || body.expectedVersion < 1) throw new HttpError(422, 'invalid_payload');
  const repository = new ContentDraftRepository(db);
  const saved = await repository.get(id);
  if (!saved) throw new HttpError(404, 'not_found');
  if (saved.version !== body.expectedVersion) throw new HttpError(409, 'conflict');
  const available = await tags(db);
  const result = prepareEventPublication(saved.payload, { contentId: id,
    filmTagIds: new Set(available.filmTags.map(tag => tag.id)), eventTagIds: new Set(available.eventTags.map(tag => tag.id)) });
  if ((await repository.get(id))?.version !== saved.version) throw new HttpError(409, 'conflict');
  // Read-only check: never return a deployable payload or write publication state.
  return Response.json(result.ok ? { ok: true, version: saved.version } : { ok: false, version: saved.version, issues: result.issues });
}
