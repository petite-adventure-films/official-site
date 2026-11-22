import { HttpError } from '../auth';
export const mediaTypes = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp', 'application/pdf': 'pdf' } as const;
export type MediaType = keyof typeof mediaTypes;
export const maxMediaBytes = (type: string) => (type === 'application/pdf' ? 20 : 10) * 1024 * 1024;
export async function sha256(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
}
export function inspectMedia(buffer: ArrayBuffer, mime: MediaType): { width?: number; height?: number } {
  const b = new Uint8Array(buffer), v = new DataView(buffer);
  const ascii = (start: number, end: number) => String.fromCharCode(...b.slice(start, end));
  const bad = () => { throw new HttpError(422, 'invalid_file_format'); };
  if (b.length < 12) return bad();
  if (mime === 'application/pdf') {
    if (!/^%PDF-1\.[0-7]|^%PDF-2\.0/.test(ascii(0, 8)) || !ascii(Math.max(0, b.length - 1024), b.length).includes('%%EOF')) return bad();
    return {};
  }
  let width = 0, height = 0;
  if (mime === 'image/png' && b.length >= 33 && ascii(1, 4) === 'PNG' && b[0] === 137 && ascii(12, 16) === 'IHDR' && ascii(b.length - 8, b.length - 4) === 'IEND') {
    width = v.getUint32(16); height = v.getUint32(20);
  } else if (mime === 'image/gif' && /^GIF8[79]a$/.test(ascii(0, 6)) && b[b.length - 1] === 0x3b) {
    width = v.getUint16(6, true); height = v.getUint16(8, true);
  } else if (mime === 'image/jpeg' && b[0] === 255 && b[1] === 216 && b[b.length - 2] === 255 && b[b.length - 1] === 217) {
    let p = 2;
    while (p + 4 <= b.length) {
      if (b[p++] !== 255) break;
      while (b[p] === 255) p++;
      const marker = b[p++];
      if (marker === 218 || marker === 217) break;
      if (marker === 1 || (marker >= 208 && marker <= 215)) continue;
      if (p + 2 > b.length) break;
      const size = v.getUint16(p);
      if (size < 2 || p + size > b.length) break;
      if ([192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207].includes(marker) && size >= 8) {
        height = v.getUint16(p + 3); width = v.getUint16(p + 5); break;
      }
      p += size;
    }
  } else if (mime === 'image/webp' && b.length >= 30 && ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP' && v.getUint32(4, true) + 8 === b.length) {
    const kind = ascii(12, 16);
    if (kind === 'VP8X') {
      width = 1 + b[24] + (b[25] << 8) + (b[26] << 16); height = 1 + b[27] + (b[28] << 8) + (b[29] << 16);
    } else if (kind === 'VP8 ' && b[23] === 157 && b[24] === 1 && b[25] === 42) {
      width = v.getUint16(26, true) & 0x3fff; height = v.getUint16(28, true) & 0x3fff;
    } else if (kind === 'VP8L' && b[20] === 47) {
      width = 1 + b[21] + ((b[22] & 63) << 8); height = 1 + (b[22] >> 6) + (b[23] << 2) + ((b[24] & 15) << 10);
    }
  }
  if (!width || !height || width * height > 100_000_000) return bad();
  return { width, height };
}
export async function readLimited(stream: ReadableStream<Uint8Array> | null, limit: number) {
  if (!stream) throw new HttpError(422, 'empty_file');
  const reader = stream.getReader(); const chunks: Uint8Array[] = []; let total = 0;
  try {
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      total += value.byteLength;
      if (total > limit) { await reader.cancel(); throw new HttpError(413, 'file_too_large'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(total); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return bytes.buffer;
}
