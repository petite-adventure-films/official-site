import { validateBlogDraft } from './blog-draft';
import { emptyBlogDraft } from '../src/features/blog/draft';
import { isArticleType, type ArticleDraft, type ArticleType } from '../src/features/articles/draft';

const common = ['title', 'slug', 'body', 'filmTagIds'];
const fields: Record<ArticleType, string[]> = {
  news: [],
  pressCoverage: ['sourceName', 'sourceIssue', 'coverageLabel', 'attachmentAssetIds', 'youtubeId', 'articleHeadline', 'articleSubheadline', 'articleBody'],
  video: ['youtubeId', 'productionYear', 'productionCountry', 'duration'],
};
export function validYouTubeId(value: unknown) { return typeof value === 'string' && /^[a-zA-Z0-9_-]{11}$/.test(value); }
export function validateArticleDraft(type: unknown, value: unknown): value is ArticleDraft {
  if (!isArticleType(type) || !value || typeof value !== 'object' || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  if (Object.keys(v).some(key => ![...common, ...fields[type]].includes(key))) return false;
  // The existing body schema also bounds nesting and checks links and media nodes.
  if (!validateBlogDraft({ ...emptyBlogDraft(), title: v.title, body: v.body, filmTagIds: v.filmTagIds, ...(v.slug === undefined ? {} : { slug: v.slug }) })) return false;
  if (fields[type].some(key => !(key in v))) return false;
  for (const key of fields[type]) {
    const field = v[key];
    if (key === 'articleBody') {
      if (!validateBlogDraft({ ...emptyBlogDraft(), body: field })) return false;
    } else if (key === 'attachmentAssetIds') {
      if (!Array.isArray(field) || field.length > 20 || new Set(field).size !== field.length || field.some(id => typeof id !== 'string' || !/^asset_[a-f0-9]{32}$/.test(id))) return false;
    } else if (key === 'youtubeId') {
      if (typeof field !== 'string' || field.length > 200) return false;
    } else if (typeof field !== 'string' || field.length > (key === 'productionYear' ? 20 : key === 'duration' ? 40 : 200)) return false;
  }
  return true;
}
