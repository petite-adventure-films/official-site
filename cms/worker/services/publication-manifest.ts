import { legacyBlogMetadata } from './legacy-blog';
import { newsArticlePath } from '../../../packages/content-schema/publication-paths';
import { isArticleType, type ArticleDraft, type ArticleType } from '../../src/features/articles/draft';
import { articleDraftFromPublication, articleTarget } from '../article-publication';
import type { MediaBucket } from '../routes/media';
import { mediaTypes, readLimited, sha256, type MediaType } from './media-files';
import type { BodyNode } from '../../src/features/blog/draft';
import { blogDraftFromPublication, localBlogSlugPrefix } from '../blog-publication';
import type { Database } from '../repositories/content-drafts';
import type { Delivery } from './publication';
import { exportPublishedEvents } from './publication-export';
import { PublicationUrls } from './publication-urls';
import { tags } from '../routes/tags';

export async function buildPublicationManifest(db: Database, media: MediaBucket | undefined, delivery: Delivery) {
  const snapshot = await exportPublishedEvents(db);
  const available = await tags(db);
  const operation = await db.prepare('SELECT created_at FROM publication_operations WHERE id = ?').bind(delivery.operationId).first<{ created_at: string }>();
  if (delivery.payload.type === 'event') {
    snapshot.events = [...snapshot.events.filter(event => event.id !== delivery.contentId),
      { id: delivery.contentId, publishedAt: operation!.created_at, payload: delivery.payload }];
  }
  snapshot.filmTags = available.filmTags.filter(tag => snapshot.events.some(e => e.payload.filmTagIds.includes(tag.id))).map(({ id, name }) => ({ id, name }));
  snapshot.eventTags = available.eventTags.filter(tag => snapshot.events.some(e => e.payload.eventTagIds.includes(tag.id))).map(({ id, name }) => ({ id, name }));
  const redirects = [];
  for (const event of snapshot.events) redirects.push(...(event.id === delivery.contentId ? delivery.routes :
    await new PublicationUrls(db).plan(event.id, event.payload.slug)).redirects);
  const blogs = [];
  const published = await db.prepare(`SELECT s.content_id, r.payload, r.published_at, u.slug
    FROM publication_state s JOIN content_drafts d ON d.id = s.content_id AND d.type = 'blog'
    JOIN publication_revisions r ON r.id = s.revision_id AND r.content_id = s.content_id
    JOIN event_canonical_urls u ON u.content_id = s.content_id
    WHERE s.content_id <> ? ORDER BY s.content_id`).bind(delivery.contentId)
    .all<{ content_id: string; payload: string; published_at: string; slug: string }>();
  for (const row of published.results) {
    const content = blogDraftFromPublication(JSON.parse(row.payload));
    if (!content || row.slug !== localBlogSlugPrefix + content.slug) throw new Error('invalid_blog_release');
    const routes = await new PublicationUrls(db).plan(row.content_id, row.slug);
    const legacy = await legacyBlogMetadata(db, row.content_id);
    blogs.push({ path: routes.canonicalPath, content, publishedAt: legacy?.publishedAt ?? row.published_at, ...(legacy ? { legacy } : {}) });
    redirects.push(...routes.redirects);
  }
  if (delivery.payload.type === 'blog') {
    const legacy = await legacyBlogMetadata(db, delivery.contentId);
    blogs.push({ path: delivery.routes.canonicalPath, content: delivery.payload.content, publishedAt: legacy?.publishedAt ?? operation!.created_at, ...(legacy ? { legacy } : {}) });
    redirects.push(...delivery.routes.redirects);
  }
  const articles: { type: ArticleType; path: string; content: ArticleDraft; publishedAt: string }[] = [];
  const publishedArticles = await db.prepare(`SELECT s.content_id, d.type, r.payload, r.published_at, u.slug
    FROM publication_state s JOIN content_drafts d ON d.id = s.content_id AND d.type IN ('news', 'pressCoverage', 'video')
    JOIN publication_revisions r ON r.id = s.revision_id AND r.content_id = s.content_id
    JOIN event_canonical_urls u ON u.content_id = s.content_id WHERE s.content_id <> ? ORDER BY s.content_id`)
    .bind(delivery.contentId).all<{ content_id: string; type: ArticleType; payload: string; published_at: string; slug: string }>();
  for (const row of publishedArticles.results) {
    const content = articleDraftFromPublication(row.type, JSON.parse(row.payload));
    if (!content || row.slug !== articleTarget(row.type, content, row.content_id)) throw new Error('invalid_article_release');
    const routes = await new PublicationUrls(db).plan(row.content_id, row.slug);
    articles.push({ type: row.type, path: routes.canonicalPath, content, publishedAt: row.published_at });
    redirects.push(...routes.redirects);
  }
  if (isArticleType(delivery.payload.type) && 'content' in delivery.payload) {
    articles.push({ type: delivery.payload.type, path: delivery.routes.canonicalPath, content: delivery.payload.content, publishedAt: operation!.created_at });
    redirects.push(...delivery.routes.redirects);
  }
  const news = articles.filter(article => article.type === 'news').sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.path.localeCompare(b.path));
  news.forEach((article, index) => { article.path = newsArticlePath(article.path.split('#cms-')[1], index); });
  const ids = new Set<string>();
  function collect(node: BodyNode) {
    if (node.type === 'assetImage' || node.type === 'assetLink') ids.add(node.attrs!.assetId as string);
    for (const child of [...(node.content ?? []), ...(node.marks ?? [])]) collect(child);
  }
  for (const blog of blogs) collect(blog.content.body.doc);
  for (const article of articles) {
    collect(article.content.body.doc);
    if (article.content.articleBody) collect(article.content.articleBody.doc);
    for (const id of article.content.attachmentAssetIds ?? []) ids.add(id);
  }
  const assets = [];
  let totalBytes = 0;
  for (const id of ids) {
    const row = await db.prepare('SELECT asset_json FROM media_uploads WHERE id = ?').bind(id).first<{ asset_json: string }>();
    if (!row?.asset_json || !/^[a-f0-9]{32}$/.test(id.slice(6)) || !id.startsWith('asset_')) throw new Error('missing_blog_asset');
    const { original } = JSON.parse(row.asset_json);
    const extension = mediaTypes[original.mimeType as MediaType];
    if (!extension || !Number.isSafeInteger(original.sizeBytes) || original.sizeBytes < 1) throw new Error('invalid_blog_asset');
    totalBytes += original.sizeBytes;
    if (totalBytes > 40 * 1024 * 1024) throw new Error('local_release_assets_too_large');
    const object = await media?.get(original.storageKey);
    if (!object || object.size !== original.sizeBytes) throw new Error('missing_blog_asset');
    const bytes = await readLimited(object.body, original.sizeBytes);
    if (bytes.byteLength !== original.sizeBytes || await sha256(bytes) !== original.sha256) throw new Error('invalid_blog_asset');
    assets.push({ id, extension, bytes: Buffer.from(bytes).toString('base64') });
  }
  return { delivery, snapshot, redirects, blogs, articles, assets };
}
