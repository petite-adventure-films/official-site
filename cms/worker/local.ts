import { LocalPublicationDelivery } from './adapters/local-publication';
import { exportPublishedEvents } from './services/publication-export';
import { localMediaPut } from './routes/media';
import { handleAuthenticated, errorResponse, secureResponse, type AppEnvironment } from './app';
// Local entry only: never imported by the production Worker.
export default {
  async fetch(request: Request, env: AppEnvironment & { LOCAL_PUBLICATION?: string; LOCAL_PUBLICATION_PORT?: string; LOCAL_SITE_PORT?: string } = {}): Promise<Response> {
    if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(request.url).hostname)) {
      return secureResponse(new Response(null, { status: 403 }));
    }
    try {
      const upload = new URL(request.url).pathname.match(/^\/api\/local\/media\/(asset_[a-f0-9]{32})$/);
      if (upload && env.DB && env.MEDIA) return secureResponse(await localMediaPut(request, env.DB, env.MEDIA, upload[1]));
      if (new URL(request.url).pathname === '/api/local/published-events') {
        if (request.method !== 'GET') return secureResponse(new Response(null, { status: 405 }));
        if (!env.DB) return secureResponse(new Response(null, { status: 503 }));
        return secureResponse(Response.json(await exportPublishedEvents(env.DB)));
      }
      return secureResponse(await handleAuthenticated(request, { ...env, LOCAL_MEDIA: true, PUBLICATION: env.DB && env.LOCAL_PUBLICATION ? new LocalPublicationDelivery(env.DB, Number(env.LOCAL_PUBLICATION_PORT ?? 8789), `http://127.0.0.1:${Number(env.LOCAL_SITE_PORT ?? 4327)}`) : undefined },
        { id: 'local-editor', email: 'editor@localhost', name: '開発用ユーザー' }, 'http://127.0.0.1:5174'));
    } catch (error) { return secureResponse(errorResponse(error)); }
  },
};
