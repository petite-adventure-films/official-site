import { describe, expect, it } from 'vitest';

import { wpGetCustom, wpGetDetail, wpGetList, WP_API_BASE } from './wp-api';
import type { Blog } from '@/types/blog';
import type { EventDetail, EventList, EventSummary } from '@/types/event';
import type { News } from '@/types/news';

describe('local WordPress snapshot adapter', () => {
  it('uses the local snapshot instead of a remote API', () => {
    expect(WP_API_BASE).toBe('local-wordpress-snapshot');
  });

  it('paginates news', async () => {
    const firstPage = await wpGetList<News>('news', { per_page: 10, page: '1' });
    expect(firstPage.data).toHaveLength(10);
    expect(firstPage.total_pages).toBeGreaterThan(1);
  });

  it('filters blog posts by category and normalizes blog flags', async () => {
    const category = await wpGetList<Blog>('blog', {
      category_name: '制作日誌',
      per_page: -1,
    });
    const blogs = await wpGetList<Blog>('blog', { per_page: -1 });
    const workshop = blogs.data.filter((post) => post.isWorkshopReport);
    const recommended = blogs.data.filter((post) => post.isRecommended);

    expect(category.data.length).toBeGreaterThan(0);
    expect(
      category.data.every((post) => post.categories.some((item) => item.name === '制作日誌')),
    ).toBe(true);
    expect(workshop).toHaveLength(16);
    expect(recommended).toHaveLength(27);
    expect(blogs.data.some((post) => Object.hasOwn(post, 'recommended'))).toBe(false);
    expect(blogs.data.some((post) => Object.hasOwn(post, 'tag_ids'))).toBe(false);
  });

  it('returns event archives, details, and the current grouped event list', async () => {
    const archive = await wpGetList<EventSummary>('events_archive', { year: '2011' });
    expect(archive.data.length).toBeGreaterThan(10);
    expect(archive.data.every((event) => event.date_from.startsWith('2011/'))).toBe(true);

    const detail = await wpGetDetail<EventDetail>('events_detail', {
      pageId: String(archive.data[0].id),
    });
    expect(detail?.id).toBe(archive.data[0].id);

    const grouped = await wpGetCustom<EventList>('events');
    expect(grouped).not.toBeNull();
    expect(Object.keys(grouped ?? {}).length).toBeGreaterThan(0);
  });
});
