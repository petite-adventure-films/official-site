// Dedicated migration attachment delivery. Articles and migration/source metadata have no route.
import {
  mediaTypes,
  maxMediaBytes,
} from '../../packages/content-schema/media-policy';
type Environment = {
  DB: {
    prepare(sql: string): {
      bind(...args: string[]): { first<T>(): Promise<T | null> };
    };
  };
  MEDIA: {
    get(
      key: string,
    ): Promise<{ size: number; arrayBuffer(): Promise<ArrayBuffer> } | null>;
  };
};
export default {
  async fetch(request: Request, env: Environment): Promise<Response> {
    const reply = (status: number) =>
      new Response(null, { status, headers: { 'Cache-Control': 'no-store' } });
    const match = new URL(request.url).pathname.match(
      /^\/media\/(asset_[a-f0-9]{32})\.(jpg|png|gif|webp|pdf)$/,
    );
    if (!match) return reply(404);
    if (!['GET', 'HEAD'].includes(request.method)) return reply(405);
    try {
      const row = await env.DB.prepare(
        `SELECT u.asset_json FROM wordpress_media_objects m
        JOIN media_uploads u ON u.id=m.asset_id WHERE m.asset_id=? AND m.state='confirmed'`,
      )
        .bind(match[1])
        .first<{ asset_json: string }>();
      if (!row) return reply(404);
      const asset = JSON.parse(row.asset_json),
        original = asset.original;
      const mime = original?.mimeType as keyof typeof mediaTypes;
      if (
        asset.id !== match[1] ||
        !Object.hasOwn(mediaTypes, mime) ||
        mediaTypes[mime] !== match[2] ||
        !/^[a-f0-9]{64}$/.test(original.sha256) ||
        !Number.isSafeInteger(original.sizeBytes) ||
        original.sizeBytes < 1 ||
        original.sizeBytes > maxMediaBytes(mime) ||
        original.storageKey !==
          `originals/${original.sha256.slice(0, 2)}/${original.sha256}.${match[2]}`
      )
        return reply(503);
      const object = await env.MEDIA.get(original.storageKey);
      if (!object || object.size !== original.sizeBytes) return reply(503);
      const bytes = await object.arrayBuffer();
      const actual = Array.from(
        new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)),
        (b) => b.toString(16).padStart(2, '0'),
      ).join('');
      if (bytes.byteLength !== original.sizeBytes || actual !== original.sha256)
        return reply(503);
      return new Response(request.method === 'HEAD' ? null : bytes, {
        headers: {
          'Content-Type': mime,
          'Content-Length': String(original.sizeBytes),
          'Content-Disposition': `${mime === 'application/pdf' ? 'attachment' : 'inline'}; filename="${match[1]}.${match[2]}"`,
          'Cache-Control': 'public, max-age=31536000, immutable',
          ETag: `"${original.sha256}"`,
          'X-Content-Type-Options': 'nosniff',
          'Content-Security-Policy': "sandbox; default-src 'none'",
        },
      });
    } catch {
      return reply(503);
    }
  },
};
