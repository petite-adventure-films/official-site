import { slugIssue } from '../src/features/content/slug';
import type { BlogDraft } from '../src/features/blog/draft';
import { validateBlogDraft } from './blog-draft';
import type { Database } from './repositories/content-drafts';
import { validateDraftReferences } from './services/draft-references';

export const blogPublicationVersion = 'blog-publication/v1';

export type BlogPublication = {
  type: 'blog';
  payloadSchemaVersion: typeof blogPublicationVersion;
  content: BlogDraft;
};

export async function prepareBlogPublication(db: Database, payload: unknown): Promise<BlogPublication> {
  if (!validateBlogDraft(payload) || !payload.title.trim() || (!payload.slug || slugIssue(payload.slug))) {
    throw new Error('invalid_blog_publication');
  }
  await validateDraftReferences(db, 'blog', payload as BlogDraft);
  return { type: 'blog', payloadSchemaVersion: blogPublicationVersion, content: structuredClone(payload as BlogDraft) };
}

export function blogDraftFromPublication(payload: unknown): BlogDraft | null {
  if (!payload || typeof payload !== 'object') return null;
  const snapshot = payload as Partial<BlogPublication>;
  if (snapshot.type !== 'blog' || snapshot.payloadSchemaVersion !== blogPublicationVersion ||
      !validateBlogDraft(snapshot.content) || !snapshot.content.title.trim() || (!snapshot.content.slug || slugIssue(snapshot.content.slug))) return null;
  return snapshot.content;
}

export const localBlogSlugPrefix = 'local-blog/';

export function blogPath(slug: string) {
  return `/${encodeURIComponent(slug)}/`;
}
