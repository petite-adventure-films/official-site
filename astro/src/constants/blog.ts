export const BLOG_PER_PAGE = 10;

export const WORKSHOP_REPORT_ARCHIVE = {
  name: '映像ワークショップレポート',
  slug: '映像ワークショップレポート',
} as const;

export const BLOG_CATEGORIES = [
  '上映会・イベントレポート',
  '制作日誌',
  '映画監督、日々の暮らし',
  '雑木林コラム',
] as const;

export const BLOG_META = {
  all: 'ドキュメンタリー監督、早川由美子のブログページです。',
  recommended:
    'ドキュメンタリー監督、早川由美子のブログ記事の中から、おすすめ記事をピックアップしてご紹介しています。',
  archive: (name: string) =>
    `ドキュメンタリー監督、早川由美子のブログ記事の中で、${name}記事一覧です。`,
};
