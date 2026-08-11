import snapshotData from '../../data/wordpress-export.json';

export const WP_API_BASE = 'local-wordpress-snapshot';

type LegacyTerm = {
  id?: number;
  term_id?: number;
  name: string;
  slug?: string;
  count?: number;
};

type LegacyRecord = {
  id: number;
  name?: string;
  published?: string;
  recommended?: string;
  date_from?: string;
  date_to?: string;
  categories?: LegacyTerm[] | false;
  tag_ids?: number[];
  isRecommended?: boolean;
  isWorkshopReport?: boolean;
  [key: string]: unknown;
};

type WordPressSnapshot = {
  content: {
    blogs: LegacyRecord[];
    news: LegacyRecord[];
    events: LegacyRecord[];
    media: LegacyRecord[];
    channels: LegacyRecord[];
  };
  taxonomies: {
    blogTags: LegacyTerm[];
  };
};

const snapshot = snapshotData as WordPressSnapshot;
const LEGACY_WORKSHOP_REPORT_TAG_ID = 5026;
const blogs = snapshot.content.blogs.map(({ recommended, tag_ids: legacyTagIds, ...blog }) => ({
  ...blog,
  isRecommended: recommended === '1',
  isWorkshopReport: legacyTagIds?.includes(LEGACY_WORKSHOP_REPORT_TAG_ID) ?? false,
}));

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
  post__not_in?: number;
};

type WpListResponse<T> = { data: T[]; total_pages: number };

export type WpDetailQuery = {
  pageId?: string;
  pageName?: string;
};

function decodeSlug(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function paginate<T>(items: T[], query?: WpListQuery): WpListResponse<T> {
  const perPage = query?.per_page ?? 10;
  if (perPage < 0) return { data: items, total_pages: items.length > 0 ? 1 : 0 };

  const page = Number(query?.page ?? '1');
  const totalPages = Math.ceil(items.length / perPage);
  const offset = (page - 1) * perPage;
  return { data: items.slice(offset, offset + perPage), total_pages: totalPages };
}

function filterBlogs(query?: WpListQuery) {
  let filteredBlogs = blogs;

  if (query?.category_name) {
    const categoryName = decodeSlug(query.category_name);
    filteredBlogs = filteredBlogs.filter((blog) =>
      blog.categories
        ? blog.categories.some(
            (category) =>
              category.name === categoryName || decodeSlug(category.slug ?? '') === categoryName,
          )
        : false,
    );
  }

  if (query?.post__not_in !== undefined) {
    filteredBlogs = filteredBlogs.filter((blog) => blog.id !== query.post__not_in);
  }

  return filteredBlogs;
}

function eventTimestamp(value: unknown) {
  if (typeof value !== 'string') return Number.NaN;
  const match = value.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (!match) return Number.NaN;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])).getTime();
}

function getCurrentEvents() {
  const currentYear = new Date().getFullYear();
  const startOfCurrentYear = new Date(currentYear, 0, 1).getTime();
  return snapshot.content.events.filter(
    (event) => eventTimestamp(event.date_from) >= startOfCurrentYear,
  );
}

function groupEventsByMonth(events: LegacyRecord[]) {
  const grouped: Record<string, Record<string, LegacyRecord[]>> = {};

  for (const event of events) {
    const start = new Date(eventTimestamp(event.date_from));
    const endTimestamp = eventTimestamp(event.date_to);
    const end = Number.isNaN(endTimestamp) ? start : new Date(endTimestamp);
    if (Number.isNaN(start.getTime())) continue;

    const month = new Date(start.getFullYear(), start.getMonth(), 1);
    const lastMonth = new Date(end.getFullYear(), end.getMonth(), 1);
    while (month <= lastMonth) {
      const yearKey = String(month.getFullYear());
      const monthKey = String(month.getMonth() + 1);
      grouped[yearKey] ??= {};
      grouped[yearKey][monthKey] ??= [];
      grouped[yearKey][monthKey].push(event);
      month.setMonth(month.getMonth() + 1);
    }
  }

  return grouped;
}

export async function wpGetList<T>(
  endpoint: WpEndpoint,
  query?: WpListQuery,
): Promise<WpListResponse<T>> {
  let records: LegacyRecord[];

  switch (endpoint) {
    case 'blog':
      records = filterBlogs(query);
      break;
    case 'news':
      records = snapshot.content.news;
      break;
    case 'media':
      records = snapshot.content.media;
      break;
    case 'channel':
      records = snapshot.content.channels;
      break;
    case 'events_archive':
      records = snapshot.content.events.filter((event) =>
        event.date_from?.startsWith(query?.year ?? ''),
      );
      return { data: records as T[], total_pages: records.length > 0 ? 1 : 0 };
    case 'dvd':
      records = [];
      break;
    default:
      records = [];
  }

  return paginate(records, query) as WpListResponse<T>;
}

export async function wpGetDetail<T>(
  endpoint: WpEndpoint,
  query: WpDetailQuery,
): Promise<T | null> {
  const pageId = Number(query.pageId);
  let record: LegacyRecord | undefined;

  switch (endpoint) {
    case 'blog_detail':
      record = blogs.find((blog) => blog.name === query.pageName);
      break;
    case 'events_detail':
      record = snapshot.content.events.find((event) => event.id === pageId);
      break;
    case 'media_detail':
      record = snapshot.content.media.find((media) => media.id === pageId);
      break;
    case 'channel_detail':
      record = snapshot.content.channels.find((channel) => channel.id === pageId);
      break;
    default:
      record = undefined;
  }

  return (record as T | undefined) ?? null;
}

export async function wpGetCustom<T>(endpoint: WpEndpoint): Promise<T | null> {
  if (endpoint !== 'events') return null;
  return groupEventsByMonth(getCurrentEvents()) as T;
}
