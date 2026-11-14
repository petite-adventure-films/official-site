import { createRemoteJWKSet, errors, jwtVerify, type JWTVerifyGetKey } from 'jose';

export type AuthConfig = {
  CMS_ORIGIN: string;
  ACCESS_ISSUER: string;
  ACCESS_AUDIENCE: string;
  ALLOWED_USERS: string;
};
export type Actor = { id: string; email: string; name: string };
export class HttpError extends Error {
  constructor(public status: number, public code: string) { super(code); }
}
const resolvers = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

export async function authenticate(request: Request, env: Partial<AuthConfig>, key?: JWTVerifyGetKey): Promise<Actor> {
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) throw new HttpError(401, 'unauthorized');
  let users: { email: string; name: string }[];
  try {
    if (!env.CMS_ORIGIN || new URL(env.CMS_ORIGIN).origin !== env.CMS_ORIGIN ||
      new URL(env.CMS_ORIGIN).protocol !== 'https:' ||
      !/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(env.ACCESS_ISSUER ?? '') ||
      !env.ACCESS_AUDIENCE) throw new Error();
    users = JSON.parse(env.ALLOWED_USERS ?? '');
    if (!Array.isArray(users) || users.length !== 2 || users.some((user) =>
      typeof user?.email !== 'string' || !user.email.includes('@') ||
      typeof user.name !== 'string' || !user.name.trim()) ||
      new Set(users.map((user) => user.email.toLowerCase())).size !== 2) throw new Error();
  } catch { throw new HttpError(503, 'authentication_unavailable'); }
  if (new URL(request.url).origin !== env.CMS_ORIGIN) throw new HttpError(403, 'forbidden_host');
  const issuer = env.ACCESS_ISSUER!;
  if (!key) {
    if (!resolvers.has(issuer)) resolvers.set(issuer, createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`)));
    key = resolvers.get(issuer)!;
  }
  let payload;
  try {
    ({ payload } = await jwtVerify(token, key, {
      issuer,
      audience: env.ACCESS_AUDIENCE,
      algorithms: ['RS256'],
      requiredClaims: ['sub', 'email', 'exp', 'iss', 'aud'],
    }));
  } catch (error) {
    if (error instanceof errors.JWKSTimeout || !(error instanceof errors.JOSEError)) {
      throw new HttpError(503, 'authentication_unavailable');
    }
    throw new HttpError(401, 'unauthorized');
  }
  if (typeof payload.sub !== 'string' || !payload.sub || typeof payload.email !== 'string') {
    throw new HttpError(401, 'unauthorized');
  }
  const user = users.find((user) => user.email.toLowerCase() === (payload.email as string).toLowerCase());
  if (!user) throw new HttpError(403, 'forbidden');
  return { id: payload.sub, email: user.email, name: user.name };
}

export function enforceMutationRequest(request: Request, origin: string) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return;
  if (request.headers.get('Origin') !== origin) throw new HttpError(403, 'forbidden_origin');
  if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    throw new HttpError(415, 'unsupported_media_type');
  }
}
