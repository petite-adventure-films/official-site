const WP_API_BASE = 'https://www.petiteadventurefilms.com/wp/wp-json/wp/v2';

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
  const res = await fetch(url.toString());
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

  const res = await fetch(url.toString());
  if (!res.ok) return null;
  const response = (await res.json()) as WpDetailResponse<T>;
  return response.data;
}

export async function wpGetCustom<T>(endpoint: WpEndpoint): Promise<T | null> {
  const res = await fetch(`${WP_API_BASE}/${endpoint}`);
  if (!res.ok) return null;
  const response = (await res.json()) as WpDetailResponse<T>;
  return response.data;
}
