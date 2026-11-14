import { authenticate, type AuthConfig } from './auth';
import { handleAuthenticated, errorResponse, secureResponse, type AppEnvironment } from './app';
export default {
  async fetch(request: Request, env: Partial<AuthConfig> & AppEnvironment = {}): Promise<Response> {
    try {
      return secureResponse(await handleAuthenticated(request, env, await authenticate(request, env), env.CMS_ORIGIN!));
    } catch (error) { return secureResponse(errorResponse(error)); }
  },
};
