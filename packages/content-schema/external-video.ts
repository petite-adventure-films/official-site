export type ExternalVideo = {
  provider: 'youtube' | 'vimeo'; videoId: string; sourceUrl: string;
  title?: string; width?: number; height?: number;
};
export const externalVideoKeys = ['provider', 'videoId', 'sourceUrl', 'title', 'width', 'height'];
export function parseVideoSource(source: unknown): Pick<ExternalVideo, 'provider' | 'videoId' | 'sourceUrl'> {
  if (typeof source !== 'string' || /[\u0000-\u0020\u007f\\]/.test(source)) throw new Error('invalid_video_url');
  const match = /^https:\/\/(www\.youtube\.com\/embed\/([A-Za-z0-9_-]{11})|player\.vimeo\.com\/video\/([0-9]+))(?:\?[^#]*)?$/.exec(source);
  if (!match) throw new Error('unsupported_video_url');
  const provider = match[2] ? 'youtube' : 'vimeo';
  const seen = new Set<string>();
  for (const [key, value] of new URL(source).searchParams) {
    if (seen.has(key)) throw new Error('duplicate_video_parameter');
    seen.add(key);
    if (provider === 'youtube' && key === 'start' && /^[0-9]{1,7}$/.test(value)) continue;
    if (provider === 'youtube' && key === 'si' && /^[A-Za-z0-9_-]{1,128}$/.test(value)) continue;
    if (provider === 'vimeo' && key === 'h' && /^[a-fA-F0-9]{1,64}$/.test(value)) continue;
    throw new Error('unsupported_video_parameter');
  }
  return { provider, videoId: match[2] || match[3], sourceUrl: source };
}
export function validExternalVideo(value: unknown): value is ExternalVideo {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  if (Object.keys(v).some(key => !externalVideoKeys.includes(key))) return false;
  try {
    const parsed = parseVideoSource(v.sourceUrl);
    return parsed.provider === v.provider && parsed.videoId === v.videoId &&
      (v.title === undefined || (typeof v.title === 'string' && v.title.length <= 2000)) &&
      ['width', 'height'].every(key => v[key] === undefined || (typeof v[key] === 'number' && Number.isInteger(v[key]) && v[key] > 0 && v[key] <= 99999));
  } catch { return false; }
}
export function videoFromElement(element: Element): ExternalVideo {
  const result: ExternalVideo = parseVideoSource(element.getAttribute('src'));
  const title = element.getAttribute('title');
  if (title !== null) result.title = title;
  for (const key of ['width', 'height'] as const) {
    const value = element.getAttribute(key);
    if (value !== null) {
      if (!/^[1-9][0-9]{0,4}$/.test(value)) throw new Error('invalid_video_dimension');
      result[key] = Number(value);
    }
  }
  if (!validExternalVideo(result)) throw new Error('invalid_video_attributes');
  return result;
}
export function videoFrameAttributes(value: unknown, fallbackTitle = false): Record<string, string | number> {
  if (!validExternalVideo(value)) throw new Error('invalid_video_attributes');
  return {
    src: value.sourceUrl,
    ...(value.title !== undefined ? { title: value.title } : fallbackTitle ? { title: value.provider === 'youtube' ? 'YouTube 動画' : 'Vimeo 動画' } : {}),
    ...(value.width !== undefined ? { width: value.width } : {}),
    ...(value.height !== undefined ? { height: value.height } : {}),
    frameborder: '0',
    allowfullscreen: '',
  };
}
