import { AwsClient } from 'aws4fetch';
import { HttpError, type Actor } from '../auth';
import type { Database } from '../repositories/content-drafts';
import { readJson } from './json';
import { inspectMedia, maxMediaBytes, mediaTypes, readLimited, sha256, type MediaType } from '../services/media-files';
type ObjectBody = { size: number; body: ReadableStream<Uint8Array> };
export type MediaBucket = { get(key: string): Promise<ObjectBody | null>; put(key: string, value: ArrayBuffer, options?: { httpMetadata: { contentType: string } }): Promise<unknown> };
export type MediaEnvironment = { MEDIA?: MediaBucket; MEDIA_SIGNING?: { accountId: string; bucket: string; accessKeyId: string; secretAccessKey: string }; LOCAL_MEDIA?: boolean };
type Upload = { id: string; actor: string; operation_id: string; request_json: string; created_at: string; expires_at: number; asset_json: string | null };
type Input = { filename: string; mimeType: MediaType; sizeBytes: number; sha256: string };
const idPattern = 'asset_[a-f0-9]{32}';
const pendingKey = (id: string) => `uploads/${id}`;
async function getUpload(db: Database, id: string) {
  const row = await db.prepare('SELECT * FROM media_uploads WHERE id = ?').bind(id).first<Upload>();
  if (!row) throw new HttpError(404, 'not_found');
  return row;
}
export async function media(request: Request, db: Database, env: MediaEnvironment, actor: Actor) {
  if (!env.MEDIA) throw new HttpError(503, 'media_unavailable');
  const url = new URL(request.url);
  if (url.pathname === '/api/media' && request.method === 'GET') {
    const kind = url.searchParams.get('kind'), q = url.searchParams.get('q') ?? '', page = Number(url.searchParams.get('page') ?? 1);
    if (!['image', 'document'].includes(kind ?? '') || q.length > 200 || !Number.isSafeInteger(page) || page < 1 || page > 1000000) throw new HttpError(422, 'invalid_query');
    const where = "asset_json IS NOT NULL AND json_extract(asset_json, '$.kind') = ? AND instr(lower(json_extract(asset_json, '$.originalFilename')), lower(?)) > 0";
    const rows = await db.prepare(`SELECT asset_json FROM media_uploads WHERE ${where} ORDER BY created_at DESC, id LIMIT 20 OFFSET ?`).bind(kind, q, (page - 1) * 20).all<{ asset_json: string }>();
    const count = await db.prepare(`SELECT count(*) AS n FROM media_uploads WHERE ${where}`).bind(kind, q).first<{ n: number }>();
    return Response.json({ items: rows.results.map(r => JSON.parse(r.asset_json)), count: count!.n, page });
  }
  if (url.pathname === '/api/media/uploads' && request.method === 'POST') {
    if (!env.LOCAL_MEDIA && !env.MEDIA_SIGNING) throw new HttpError(503, 'media_unavailable');
    const body = await readJson(request);
    if (!body || typeof body !== 'object' || Object.keys(body).some(k => !['operationId', 'filename', 'mimeType', 'sizeBytes', 'sha256'].includes(k)) ||
      typeof body.operationId !== 'string' || !/^[a-f0-9-]{36}$/i.test(body.operationId) || typeof body.filename !== 'string' || !body.filename.trim() || body.filename.length > 255 || /[\x00-\x1f\x7f]/.test(body.filename) ||
      !Object.hasOwn(mediaTypes, body.mimeType) || !Number.isSafeInteger(body.sizeBytes) || body.sizeBytes < 1 || typeof body.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(body.sha256)) throw new HttpError(422, 'invalid_payload');
    if (body.sizeBytes > maxMediaBytes(body.mimeType)) throw new HttpError(413, 'file_too_large');
    const input: Input = { filename: body.filename, mimeType: body.mimeType, sizeBytes: body.sizeBytes, sha256: body.sha256 };
    const json = JSON.stringify(input), now = Date.now();
    await db.prepare('INSERT OR IGNORE INTO media_uploads(id, actor, operation_id, request_json, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)').bind(`asset_${crypto.randomUUID().replaceAll('-', '')}`, actor.id, body.operationId, json, new Date(now).toISOString(), now + 15 * 60_000).run();
    const row = (await db.prepare('SELECT * FROM media_uploads WHERE actor = ? AND operation_id = ?').bind(actor.id, body.operationId).first<Upload>())!;
    if (row.request_json !== json) throw new HttpError(409, 'operation_conflict');
    if (row.asset_json) return Response.json({ id: row.id, asset: JSON.parse(row.asset_json) });
    if (row.expires_at <= now) throw new HttpError(410, 'upload_expired');
    let uploadUrl = `/api/local/media/${row.id}`;
    if (!env.LOCAL_MEDIA) {
      const config = env.MEDIA_SIGNING!;
      if (!/^[a-f0-9]{32}$/.test(config.accountId) || !/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(config.bucket)) throw new HttpError(503, 'media_unavailable');
      const target = new URL(`https://${config.accountId}.r2.cloudflarestorage.com/${config.bucket}/${pendingKey(row.id)}`);
      target.searchParams.set('X-Amz-Expires', String(Math.max(1, Math.floor((row.expires_at - now) / 1000))));
      const client = new AwsClient({ accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey, service: 's3', region: 'auto' });
      uploadUrl = (await client.sign(target, { method: 'PUT', headers: { 'Content-Type': input.mimeType }, aws: { signQuery: true, allHeaders: true } })).url;
    }
    return Response.json({ id: row.id, uploadUrl, expiresAt: row.expires_at, headers: { 'Content-Type': input.mimeType } }, { status: 201 });
  }
  const match = url.pathname.match(new RegExp(`^/api/media/(${idPattern})/(complete|file)$`));
  if (!match) throw new HttpError(404, 'not_found');
  const row = await getUpload(db, match[1]);
  if (match[2] === 'file' && request.method === 'GET') {
    if (!row.asset_json) throw new HttpError(404, 'not_found');
    const asset = JSON.parse(row.asset_json), object = await env.MEDIA.get(asset.original.storageKey);
    if (!object) throw new HttpError(404, 'not_found');
    return new Response(object.body, { headers: { 'Content-Type': asset.original.mimeType, 'Content-Disposition': `${asset.kind === 'document' ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(asset.originalFilename).replaceAll("'", '%27')}`, 'Content-Security-Policy': "sandbox; default-src 'none'" } });
  }
  if (match[2] !== 'complete' || request.method !== 'POST') throw new HttpError(404, 'not_found');
  if (row.actor !== actor.id) throw new HttpError(403, 'forbidden');
  if (row.asset_json) return Response.json(JSON.parse(row.asset_json));
  if (row.expires_at <= Date.now()) throw new HttpError(410, 'upload_expired');
  const input: Input = JSON.parse(row.request_json), object = await env.MEDIA.get(pendingKey(row.id));
  if (!object) throw new HttpError(409, 'upload_missing');
  if (object.size !== input.sizeBytes) throw new HttpError(422, 'file_size_mismatch');
  const bytes = await readLimited(object.body, input.sizeBytes);
  if (bytes.byteLength !== input.sizeBytes || await sha256(bytes) !== input.sha256) throw new HttpError(422, 'file_hash_mismatch');
  const dimensions = inspectMedia(bytes, input.mimeType), storageKey = `originals/${input.sha256.slice(0, 2)}/${input.sha256}.${mediaTypes[input.mimeType]}`;
  await env.MEDIA.put(storageKey, bytes, { httpMetadata: { contentType: input.mimeType } });
  const asset = { schemaVersion: 1, id: row.id, type: 'asset', originalFilename: input.filename, createdAt: row.created_at,
    kind: input.mimeType === 'application/pdf' ? 'document' : 'image',
    ...(input.mimeType === 'application/pdf' ? {} : { defaultAltText: '', renditions: [] }),
    original: { storageKey, mimeType: input.mimeType, sizeBytes: input.sizeBytes, sha256: input.sha256, ...dimensions } };
  await db.prepare('UPDATE media_uploads SET asset_json = ? WHERE id = ? AND asset_json IS NULL').bind(JSON.stringify(asset), row.id).run();
  return Response.json(JSON.parse((await getUpload(db, row.id)).asset_json!));
}
// Called only from the loopback-only local entry, never from the production Worker.
export async function localMediaPut(request: Request, db: Database, bucket: MediaBucket, id: string) {
  if (request.method !== 'PUT') throw new HttpError(405, 'method_not_allowed');
  if (request.headers.get('Origin') !== 'http://127.0.0.1:5174') throw new HttpError(403, 'forbidden_origin');
  const row = await getUpload(db, id), input: Input = JSON.parse(row.request_json);
  if (row.asset_json || row.expires_at <= Date.now()) throw new HttpError(410, 'upload_expired');
  if (request.headers.get('Content-Type') !== input.mimeType) throw new HttpError(415, 'unsupported_media_type');
  const bytes = await readLimited(request.body, input.sizeBytes);
  if (bytes.byteLength !== input.sizeBytes) throw new HttpError(422, 'file_size_mismatch');
  await bucket.put(pendingKey(id), bytes, { httpMetadata: { contentType: input.mimeType } });
  return new Response(null, { status: 204 });
}
