export const WP_API_BASE = (
  process.env.WP_API_BASE_URL || 'https://www.petiteadventurefilms.com/wp/wp-json/wp/v2'
).replace(/\/$/, '');

const WP_FETCH_ATTEMPTS = 3;

const wait = (milliseconds: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

async function wpFetch(url: string): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= WP_FETCH_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status < 500) return response;
      lastError = new Error(`WordPress API returned ${String(response.status)}: ${url}`);
    } catch (error) {
      lastError = error;
    }

    if (attempt < WP_FETCH_ATTEMPTS) await wait(200 * attempt);
  }

  throw lastError instanceof Error ? lastError : new Error(`WordPress API request failed: ${url}`);
}

export type WpEndpoint =
  | 'news'
  | 'channel'
  | 'channel_detail'
  | 'media'
  | 'media_detail'
  | 'events'
  | 'events_detail'
  | 'events_archive'
  | 'blog'
  | 'blog_detail'
  | 'dvd'
  | 'dvd_detail';

export type WpListQuery = {
  page?: string;
  per_page?: number;
  year?: string;
  category_name?: string;
  tag?: string;
  post__not_in?: number;
  meta_key?: string;
  meta_value?: string | number;
};

type WpListResponse<T> = { data: T[]; total_pages: number };

type WpDetailResponse<T> = { data: T };

export type WpDetailQuery = {
  pageId?: string;
  pageName?: string;
};

export async function wpGetList<T>(
  endpoint: WpEndpoint,
  query?: WpListQuery,
): Promise<WpListResponse<T>> {
  const url = new URL(`${WP_API_BASE}/${endpoint}`);
  if (query) {
    for (const [key, value] of Object.entries(query) as Array<
      [string, string | number | undefined]
    >) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  const res = await wpFetch(url.toString());
  if (!res.ok) return { data: [], total_pages: 0 };
  return (await res.json()) as WpListResponse<T>;
}

export async function wpGetDetail<T>(
  endpoint: WpEndpoint,
  query: WpDetailQuery,
): Promise<T | null> {
  const url = new URL(`${WP_API_BASE}/${endpoint}`);
  for (const [key, value] of Object.entries(query) as Array<[string, string | undefined]>) {
    if (value !== undefined) url.searchParams.set(key, value);
  }

  const res = await wpFetch(url.toString());
  if (!res.ok) return null;
  const response = (await res.json()) as WpDetailResponse<T>;
  return response.data;
}

export async function wpGetCustom<T>(endpoint: WpEndpoint): Promise<T | null> {
  const res = await wpFetch(`${WP_API_BASE}/${endpoint}`);
  if (!res.ok) return null;
  const response = (await res.json()) as WpDetailResponse<T>;
  return response.data;
}

export async function wpGetNativeCollection<T>(
  endpoint: string,
  query: Record<string, string | number> = {},
): Promise<T[]> {
  const firstUrl = new URL(`${WP_API_BASE}/${endpoint}`);
  firstUrl.searchParams.set('per_page', '100');
  firstUrl.searchParams.set('page', '1');
  for (const [key, value] of Object.entries(query)) firstUrl.searchParams.set(key, String(value));

  const firstResponse = await wpFetch(firstUrl.toString());
  if (!firstResponse.ok) return [];
  const firstPage = (await firstResponse.json()) as T[];
  const totalPages = Number(firstResponse.headers.get('X-WP-TotalPages') || '1');
  const pages = [firstPage];

  for (let page = 2; page <= totalPages; page += 1) {
    const url = new URL(firstUrl);
    url.searchParams.set('page', String(page));
    const response = await wpFetch(url.toString());
    if (!response.ok) continue;
    pages.push((await response.json()) as T[]);
  }

  return pages.flat();
}
