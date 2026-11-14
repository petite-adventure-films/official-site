import type { Database } from '../repositories/content-drafts';
export async function tags(db: Database) {
  const rows = await db.prepare('SELECT id, kind, name FROM tags ORDER BY kind, id').all<{ id: string; kind: string; name: string }>();
  return { filmTags: rows.results.filter((row) => row.kind === 'film'), eventTags: rows.results.filter((row) => row.kind === 'event') };
}
