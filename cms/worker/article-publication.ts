import { slugIssue } from '../src/features/content/slug';
import { isArticleType, type ArticleDraft, type ArticleType } from '../src/features/articles/draft';
import { validateArticleDraft, validYouTubeId } from './article-draft';
import type { Database } from './repositories/content-drafts';
import { validateDraftReferences } from './services/draft-references';
export type ArticlePublication = { type: ArticleType; payloadSchemaVersion: string; content: ArticleDraft };
export const articlePrefix = { news: 'cms-news/', pressCoverage: 'cms-media/', video: 'cms-channel/' } as const;
export function articleTarget(type: ArticleType, content: ArticleDraft, id: string) {
  return articlePrefix[type] + (type === 'news' ? id : content.slug);
}
function validPublication(type: ArticleType, value: unknown): value is ArticleDraft {
  if (!validateArticleDraft(type, value) || !value.title.trim()) return false;
  if (type !== 'news' && (!value.slug || slugIssue(value.slug))) return false;
  if (type === 'video' && !validYouTubeId(value.youtubeId)) return false;
  if (type === 'pressCoverage' && value.youtubeId && !validYouTubeId(value.youtubeId)) return false;
  return true;
}
export async function prepareArticlePublication(db: Database, type: ArticleType, payload: unknown, contentId?: string): Promise<ArticlePublication> {
  if (type !== 'news' && contentId && validateArticleDraft(type, payload) && payload.slug === undefined) payload = { ...payload, slug: contentId };
  if (!validPublication(type, payload)) throw new Error('invalid_article_publication');
  await validateDraftReferences(db, type, payload);
  return { type, payloadSchemaVersion: `${type}-publication/v1`, content: structuredClone(payload) };
}
export function articleDraftFromPublication(type: ArticleType, value: unknown): ArticleDraft | null {
  if (!value || typeof value !== 'object') return null;
  const p = value as Partial<ArticlePublication>;
  return isArticleType(p.type) && p.type === type && p.payloadSchemaVersion === `${type}-publication/v1` && validPublication(type, p.content) ? p.content : null;
}
