export const NEWS_PER_PAGE = 10;
export function newsArticlePath(id: string, index = 0) {
  const page = Math.floor(index / NEWS_PER_PAGE) + 1;
  return `${page === 1 ? '/news/' : `/news/page/${page}/`}#cms-${encodeURIComponent(id)}`;
}
