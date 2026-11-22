import type { BodyNode } from '../blog/draft';
export const articleTypes = ['news', 'pressCoverage', 'video'] as const;
export type ArticleType = typeof articleTypes[number];
export type ContentType = 'event' | 'blog' | ArticleType;
export type ArticleBody = { schemaVersion: 2; doc: BodyNode };
export type ArticleDraft = {
  title: string; slug?: string; body: ArticleBody; filmTagIds: string[];
  sourceName?: string; sourceIssue?: string; coverageLabel?: string; attachmentAssetIds?: string[];
  articleHeadline?: string; articleSubheadline?: string; articleBody?: ArticleBody;
  youtubeId?: string; productionYear?: string; productionCountry?: string; duration?: string;
};
export const contentSections: Record<ContentType, string> = { event: 'events', blog: 'blog', news: 'news', pressCoverage: 'media', video: 'channel' };
export const contentLabels: Record<ContentType, string> = { event: 'イベント', blog: 'ブログ', news: 'お知らせ', pressCoverage: 'メディア掲載', video: 'チャンネル' };
export function isArticleType(value: unknown): value is ArticleType { return articleTypes.includes(value as ArticleType); }
export function isContentType(value: unknown): value is ContentType { return value === 'event' || value === 'blog' || isArticleType(value); }
export const emptyBody = (): ArticleBody => ({ schemaVersion: 2, doc: { type: 'doc', content: [{ type: 'paragraph' }] } });
export function emptyArticleDraft(type: ArticleType): ArticleDraft {
  return { title: '', body: emptyBody(), filmTagIds: [],
    ...(type === 'pressCoverage' ? { sourceName: '', sourceIssue: '', coverageLabel: '', attachmentAssetIds: [], youtubeId: '', articleHeadline: '', articleSubheadline: '', articleBody: emptyBody() } : {}),
    ...(type === 'video' ? { youtubeId: '', productionYear: '', productionCountry: '', duration: '' } : {}),
  };
}
