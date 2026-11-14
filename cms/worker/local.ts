import { LocalPublicationDelivery } from './adapters/local-publication';
import { exportPublishedEvents } from './services/publication-export';
import { handleAuthenticated, errorResponse, secureResponse, type AppEnvironment } from './app';
// Local entry only: never imported by the production Worker.
export default {
  async fetch(request: Request, env: AppEnvironment & { LOCAL_PUBLICATION?: string } = {}): Promise<Response> {
    if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(request.url).hostname)) {
      return secureResponse(new Response(null, { status: 403 }));
    }
    try {
      if (new URL(request.url).pathname === '/api/local/published-events') {
        if (request.method !== 'GET') return secureResponse(new Response(null, { status: 405 }));
        if (!env.DB) return secureResponse(new Response(null, { status: 503 }));
        return secureResponse(Response.json(await exportPublishedEvents(env.DB)));
      }
      return secureResponse(await handleAuthenticated(request, { ...env, PUBLICATION: env.DB && env.LOCAL_PUBLICATION ? new LocalPublicationDelivery(env.DB) : undefined },
        { id: 'local-editor', email: 'editor@localhost', name: '開発用ユーザー' }, 'http://127.0.0.1:5174'));
    } catch (error) { return secureResponse(errorResponse(error)); }
  },
};
