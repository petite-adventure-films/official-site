import { enforceMutationRequest, HttpError, type Actor } from './auth';
import type { Database } from './repositories/content-drafts';
import { publicationCheck } from './routes/publication-check';
import { contents } from './routes/contents';
import { duplicate } from './routes/duplicate';
import { tags } from './routes/tags';
export type AppEnvironment = { DB?: Database; ASSETS?: { fetch(request: Request): Promise<Response> } };
export async function handleAuthenticated(request: Request, env: AppEnvironment, actor: Actor, origin: string) {
  enforceMutationRequest(request, origin);
  const path = new URL(request.url).pathname;
  if (path === '/api/session' && request.method === 'GET') return Response.json({ user: actor });
  if (path === '/api/tags' && request.method === 'GET') {
    if (!env.DB) throw new HttpError(503, 'storage_unavailable');
    return Response.json(await tags(env.DB));
  }
  if (path.startsWith('/api/contents')) {
    if (!env.DB) throw new HttpError(503, 'storage_unavailable');
    const check = path.match(/^\/api\/contents\/([0-9a-f-]{36})\/check-publication$/i);
    if (check) return publicationCheck(request, env.DB, check[1]);
    const copy = path.match(/^\/api\/contents\/([0-9a-f-]{36})\/duplicate$/i);
    if (copy) return duplicate(request, env.DB, actor, copy[1]);
    return contents(request, env.DB, actor);
  }
  if (path.startsWith('/api/')) throw new HttpError(404, 'not_found');
  if (env.ASSETS && ['GET', 'HEAD'].includes(request.method)) return env.ASSETS.fetch(request);
  throw new HttpError(404, 'not_found');
}
export function errorResponse(error: unknown) {
  const failure = error instanceof HttpError ? error : new HttpError(503, 'unavailable');
  return Response.json({ error: failure.code }, { status: failure.status });
}
export function secureResponse(response: Response) {
  const result = new Response(response.body, response);
  result.headers.set('Cache-Control', 'no-store');
  result.headers.set('X-Content-Type-Options', 'nosniff');
  result.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return result;
}
