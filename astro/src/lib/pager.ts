export type PageItem = number | 'ellipsis';

const DEFAULT_PAGE_ITEM_INTERVAL = 10;

type BuildPageItemsOptions = {
  interval?: number;
};

export function buildPageItems(
  currentPage: number,
  totalPages: number,
  options: BuildPageItemsOptions = {},
): PageItem[] {
  if (totalPages <= 0) return [];

  const interval = options.interval ?? DEFAULT_PAGE_ITEM_INTERVAL;
  const normalizedCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const visiblePages = new Set<number>([1, totalPages]);

  for (let page = 1; page <= totalPages; page += 1) {
    if (
      page % interval === 0 ||
      page === normalizedCurrentPage ||
      page === normalizedCurrentPage - 1 ||
      page === normalizedCurrentPage + 1
    ) {
      visiblePages.add(page);
    }
  }

  return [...visiblePages]
    .sort((a, b) => a - b)
    .flatMap<PageItem>((page, index, pages) => {
      const previousPage = pages[index - 1];
      if (index === 0 || page === previousPage + 1) return [page];
      return ['ellipsis', page];
    });
}
