import { beforeAll, expect, test } from 'vitest';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';
import { authenticate, enforceMutationRequest, type AuthConfig } from './auth';
import worker from './index';
import local from './local';

const config: AuthConfig = {
  CMS_ORIGIN: 'https://cms.example.test',
  ACCESS_ISSUER: 'https://team.cloudflareaccess.com',
  ACCESS_AUDIENCE: 'cms-audience',
  ALLOWED_USERS: JSON.stringify([
    { email: 'first@example.test', name: 'First' },
    { email: 'second@example.test', name: 'Second' },
  ]),
};
let keys: Awaited<ReturnType<typeof generateKeyPair>>;
let jwks: ReturnType<typeof createLocalJWKSet>;
beforeAll(async () => {
  keys = await generateKeyPair('RS256');
  jwks = createLocalJWKSet({ keys: [{ ...await exportJWK(keys.publicKey), kid: 'test', alg: 'RS256' }] });
});
async function token(claims: Record<string, unknown> = {}, signingKey = keys.privateKey) {
  return new SignJWT({ email: 'first@example.test', ...claims })
    .setProtectedHeader({ alg: 'RS256', kid: 'test' })
    .setIssuer(config.ACCESS_ISSUER).setAudience(config.ACCESS_AUDIENCE)
    .setSubject('verified-subject').setIssuedAt().setExpirationTime('5m')
    .sign(signingKey);
}
function request(jwt: string, url = config.CMS_ORIGIN + '/api/session') {
  return new Request(url, { headers: { 'Cf-Access-Jwt-Assertion': jwt } });
}
test.each(['first@example.test', 'second@example.test'])('allows configured user %s using signed identity', async (email) => {
  expect(await authenticate(request(await token({ email })), config, jwks)).toMatchObject({ id: 'verified-subject', email });
});
test('rejects a header without a valid signature', async () => {
  const other = await generateKeyPair('RS256');
  await expect(authenticate(request(await token({}, other.privateKey)), config, jwks)).rejects.toMatchObject({ status: 401 });
});
test.each([
  { iss: 'https://other.cloudflareaccess.com', aud: 'cms-audience', exp: Math.floor(Date.now() / 1000) + 300 },
  { iss: config.ACCESS_ISSUER, aud: 'other', exp: Math.floor(Date.now() / 1000) + 300 },
  { iss: config.ACCESS_ISSUER, aud: config.ACCESS_AUDIENCE, exp: 1 },
  { iss: config.ACCESS_ISSUER, aud: config.ACCESS_AUDIENCE },
])('rejects invalid issuer, audience, expiry or missing expiry: %j', async (claims) => {
  const jwt = await new SignJWT({ sub: 'subject', email: 'first@example.test', ...claims })
    .setProtectedHeader({ alg: 'RS256', kid: 'test' }).sign(keys.privateKey);
  await expect(authenticate(request(jwt), config, jwks)).rejects.toMatchObject({ status: 401 });
});
test('rejects an unlisted user and default Worker host', async () => {
  await expect(authenticate(request(await token({ email: 'outsider@example.test' })), config, jwks)).rejects.toMatchObject({ status: 403 });
  await expect(authenticate(request(await token(), 'https://cms.workers.dev/api/session'), config, jwks)).rejects.toMatchObject({ status: 403 });
});
test('fails closed with an invalid allowlist', async () => {
  await expect(authenticate(request(await token()), { ...config, ALLOWED_USERS: '[]' }, jwks)).rejects.toMatchObject({ status: 503 });
});
test.each([
  { origin: 'https://other.test', contentType: 'application/json', status: 403 },
  { origin: '', contentType: 'application/json', status: 403 },
  { origin: config.CMS_ORIGIN, contentType: 'text/plain', status: 415 },
])('rejects unsafe mutation requests: %j', ({ origin, contentType, status }) => {
  const req = new Request(config.CMS_ORIGIN + '/api/contents', {
    method: 'POST', headers: { Origin: origin, 'Content-Type': contentType }, body: '{}',
  });
  expect(() => enforceMutationRequest(req, config.CMS_ORIGIN)).toThrow(expect.objectContaining({ status }));
});
test('accepts same-origin JSON mutations', () => {
  expect(() => enforceMutationRequest(new Request(config.CMS_ORIGIN + '/api/contents', {
    method: 'PUT', headers: { Origin: config.CMS_ORIGIN, 'Content-Type': 'application/json; charset=utf-8' }, body: '{}',
  }), config.CMS_ORIGIN)).not.toThrow();
});
test('all production routes and assets require authentication', async () => {
  for (const path of ['/api/session', '/api/contents', '/cms/events', '/assets/app.js']) {
    const response = await worker.fetch(new Request(config.CMS_ORIGIN + path), config);
    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toBe('no-store');
  }
});
test('local entry rejects non-local hosts', async () => {
  expect((await local.fetch(new Request('https://cms.example.test/api/session'))).status).toBe(403);
});
