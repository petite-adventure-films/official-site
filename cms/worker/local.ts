import { handleAuthenticated, errorResponse, secureResponse, type AppEnvironment } from './app';
// Local entry only: never imported by the production Worker.
export default {
  async fetch(request: Request, env: AppEnvironment = {}): Promise<Response> {
    if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(request.url).hostname)) {
      return secureResponse(new Response(null, { status: 403 }));
    }
    try {
      return secureResponse(await handleAuthenticated(request, env,
        { id: 'local-editor', email: 'editor@localhost', name: '開発用ユーザー' }, 'http://127.0.0.1:5174'));
    } catch (error) { return secureResponse(errorResponse(error)); }
  },
};
