import { BLOG_PER_PAGE } from '@/constants/blog';
import { wpGetDetail, wpGetList } from '@/lib/wp-api';
import type { Blog } from '@/types/blog';

let postsPromise: Promise<Blog[]> | undefined;
let detailsPromise: Promise<Blog[]> | undefined;

export function paginateBlogPosts(posts: Blog[], page: number) {
  const totalPages = Math.ceil(posts.length / BLOG_PER_PAGE);
  const start = (page - 1) * BLOG_PER_PAGE;
  return { posts: posts.slice(start, start + BLOG_PER_PAGE), totalPages };
}

export function filterBlogByCategory(posts: Blog[], categoryName: string) {
  return posts.filter((post) => post.categories.some((category) => category.name === categoryName));
}

export function filterWorkshopReportBlog(posts: Blog[]) {
  return posts.filter((post) => post.isWorkshopReport);
}

export function filterRecommendedBlog(posts: Blog[]) {
  return posts.filter((post) => post.isRecommended);
}

export function decodeWordPressSlug(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export function getAllBlogPosts(): Promise<Blog[]> {
  postsPromise ??= (async () => {
    const first = await wpGetList<Blog>('blog', { per_page: 100, page: '1' });
    const pages = [first.data];
    for (let page = 2; page <= first.total_pages; page += 1) {
      const response = await wpGetList<Blog>('blog', { per_page: 100, page: String(page) });
      pages.push(response.data);
    }
    return pages.flat();
  })();
  return postsPromise;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

export function getAllBlogDetails(): Promise<Blog[]> {
  detailsPromise ??= (async () => {
    const posts = await getAllBlogPosts();
    const details = await mapWithConcurrency(posts, 5, async (post) => {
      const detail = await wpGetDetail<Blog>('blog_detail', { pageName: post.name });
      return detail ? { ...post, ...detail, name: post.name, thumbnail: post.thumbnail } : null;
    });
    return details.filter((detail): detail is Blog => detail !== null);
  })();
  return detailsPromise;
}
