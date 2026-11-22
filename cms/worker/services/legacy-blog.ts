import type { Database } from '../repositories/content-drafts';

// Internal migration boundary only. Ordinary editor/API input cannot claim a legacy URL.
export async function linkLegacyBlog(db: Database, contentId: string, sourceId: number, expectedSourceHash: string) {
  const source = await db.prepare('SELECT source_sha256 FROM legacy_blog_sources WHERE source_id = ?').bind(sourceId).first<{ source_sha256: string }>();
  if (!source || source.source_sha256 !== expectedSourceHash) throw new Error('legacy_source_mismatch');
  await db.prepare('INSERT INTO legacy_blog_links(content_id, source_id) VALUES (?, ?)').bind(contentId, sourceId).run();
}

export async function legacyBlogMetadata(db: Database, contentId: string) {
  const row = await db.prepare(`SELECT s.source_id, s.slug, s.published_at FROM legacy_blog_links l
    JOIN legacy_blog_sources s ON s.source_id = l.source_id WHERE l.content_id = ?`).bind(contentId)
    .first<{ source_id: number; slug: string; published_at: string }>();
  return row ? { id: row.source_id, slug: row.slug, publishedAt: row.published_at } : undefined;
}
