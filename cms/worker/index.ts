import { authenticate, type AuthConfig } from './auth';
import { handleAuthenticated, errorResponse, secureResponse, type AppEnvironment } from './app';
export default {
  async fetch(request: Request, env: Partial<AuthConfig> & AppEnvironment & {
    MEDIA_ACCOUNT_ID?: string; MEDIA_BUCKET_NAME?: string; MEDIA_ACCESS_KEY_ID?: string; MEDIA_SECRET_ACCESS_KEY?: string;
  } = {}): Promise<Response> {
    try {
      const actor = await authenticate(request, env);
      const signing = env.MEDIA_ACCOUNT_ID && env.MEDIA_BUCKET_NAME && env.MEDIA_ACCESS_KEY_ID && env.MEDIA_SECRET_ACCESS_KEY ? {
        accountId: env.MEDIA_ACCOUNT_ID, bucket: env.MEDIA_BUCKET_NAME, accessKeyId: env.MEDIA_ACCESS_KEY_ID, secretAccessKey: env.MEDIA_SECRET_ACCESS_KEY,
      } : undefined;
      return secureResponse(await handleAuthenticated(request, { ...env, LOCAL_MEDIA: false, MEDIA_SIGNING: signing }, actor, env.CMS_ORIGIN!));
    } catch (error) { return secureResponse(errorResponse(error)); }
  },
};
