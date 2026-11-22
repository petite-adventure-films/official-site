import { HostedStaging } from './services/hosted-staging';
import { CloudflareStagingPublication, stagingCmsOrigin, stagingRunner } from './adapters/cloudflare-staging-publication';
import { authenticate, type AuthConfig } from './auth';
import { handleAuthenticated, errorResponse, secureResponse, type AppEnvironment } from './app';
export default {
  async fetch(request: Request, env: Partial<AuthConfig> & AppEnvironment & {
    STAGING_HOSTED_PUBLICATION?: string;
    STAGING_DEPLOY_HOOK?: string;
    STAGING_RUNNER_URL?: string;
    STAGING_RUNNER_SECRET?: string;
    STAGING_SITE_ACCESS_ID?: string;
    STAGING_SITE_ACCESS_SECRET?: string;
    MEDIA_ACCOUNT_ID?: string; MEDIA_BUCKET_NAME?: string; MEDIA_ACCESS_KEY_ID?: string; MEDIA_SECRET_ACCESS_KEY?: string;
  } = {}): Promise<Response> {
    try {
      const actor = await authenticate(request, env);
      const signing = env.MEDIA_ACCOUNT_ID && env.MEDIA_BUCKET_NAME && env.MEDIA_ACCESS_KEY_ID && env.MEDIA_SECRET_ACCESS_KEY ? {
        accountId: env.MEDIA_ACCOUNT_ID, bucket: env.MEDIA_BUCKET_NAME, accessKeyId: env.MEDIA_ACCESS_KEY_ID, secretAccessKey: env.MEDIA_SECRET_ACCESS_KEY,
      } : undefined;
      const access = env.STAGING_SITE_ACCESS_ID && env.STAGING_SITE_ACCESS_SECRET ?
        { id: env.STAGING_SITE_ACCESS_ID, secret: env.STAGING_SITE_ACCESS_SECRET } : undefined;
      const temporaryRunner = env.CMS_ORIGIN === stagingCmsOrigin && env.STAGING_RUNNER_URL && env.STAGING_RUNNER_SECRET && access ?
        stagingRunner(env.STAGING_RUNNER_URL, env.STAGING_RUNNER_SECRET) : null;
      const runner = env.CMS_ORIGIN === stagingCmsOrigin && env.STAGING_HOSTED_PUBLICATION === 'true' && env.DB && env.MEDIA && access && env.STAGING_DEPLOY_HOOK
        ? new HostedStaging({ ...env, DB: env.DB, MEDIA: env.MEDIA }) : temporaryRunner;
      const publication = runner && access && env.DB && env.MEDIA ?
        new CloudflareStagingPublication(env.DB, env.MEDIA, runner, access) : undefined;
      return secureResponse(await handleAuthenticated(request, { ...env, PUBLICATION: publication, LOCAL_MEDIA: false, MEDIA_SIGNING: signing }, actor, env.CMS_ORIGIN!));
    } catch (error) { return secureResponse(errorResponse(error)); }
  },
};
